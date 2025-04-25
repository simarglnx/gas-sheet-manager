import { DocumentMapper } from "@core/data-mapper/DocumentMapper";
import { DataMapper } from "@core/data-mapper/DataMapper";
import { DataService } from "@core/data-service/DataService";
import { Repository } from "@core/repository/Repository";
import {
    EntitySchemaColumns,
    IEntitySchema,
    IEntitySchemaOptions,
    IEntitySchemaRange,
    OptionRange,
} from "@core/schema/types/EntitySchema";
import { ITable } from "@core/adapters/types/Table";
import { EntitySchema } from "@core/schema/EntitySchema";
import { MapBuilder } from "@core/map-builder/MapBuilder";
import { RequiredSchemaOption } from "@core/data-source/errors/RequiredSchemaOption";
import { OptionsSchemaDuplicate } from "@core/data-source/errors/OptionsSchemaDuplicate";
import { RangeService } from "@core/range-service/RangeService";
import { ISheet } from "@core/adapters/types/Sheet";
import { IRange } from "@core/adapters/types/Range";
import { RangeTokens } from "@core/adapters/range-builder/RangeBuilder";
import { EntityNotFound } from "@core/data-source/errors/EntityNotFound";
import { IDataStrategy } from "@core/data-mapper/types/DataMapper";
import { TransformStrategy } from "@core/repository/strategies/TranformStrategy";
import { IRepository } from "@core/repository/types/Repository";
import { Table } from "@core/adapters/Table";

export interface IDataSource {}

const DEFAULT_DATA_RANGE = {
    row: 1,
    column: 1,
    columns: `${RangeTokens.MaxColumns}`,
};
type ReadyEntitySchemaRange = {
    headers: IRange | null;
    data: IRange;
};

export class DataSource implements IDataSource {
    protected readonly id: string | null;
    protected readonly entities = new Map<string | number, IEntitySchema<any>>();
    protected readonly repositories = new Map<string | number, IRepository<any>>();
    protected table: ITable | null = null;

    constructor(options: { id?: string; entities?: IEntitySchemaOptions<any>[] } = {}) {
        this.id = options.id || null;
        options.entities?.forEach((entity) => {
            if (typeof entity.selector !== undefined && entity.selector !== null) {
                if (!this.entities.has(entity.selector)) {
                    const schema = new EntitySchema(entity);
                    this.entities.set(entity.selector, schema);
                } else throw new OptionsSchemaDuplicate(entity.selector);
            } else throw new RequiredSchemaOption("EntitySchema.selector");
        });
    }

    getRepository<Entity extends Record<string, any> = Record<string, any>>(
        selector: string | number,
    ): IRepository<Entity> {
        const table = this._getSource();
        let repository = this.repositories.get(selector);
        if (repository === undefined) {
            const entity = this.entities.get(selector);
            if (entity) {
                const sheet = table.getSheet(selector);
                const strategies = [new TransformStrategy(entity)];
                repository = createRepository<Entity>(
                    sheet,
                    entity.ranges,
                    entity.columns,
                    strategies,
                );
                this.repositories.set(selector, repository);
                return repository;
            } else throw new EntityNotFound(selector);
        }
        return repository;
    }

    protected _getSource(): ITable {
        if (!this.table) this.table = new Table(this.id || undefined);
        return this.table;
    }
}

function initRange(sheet: ISheet, range?: OptionRange, defaultRange?: string): IRange | null {
    if (typeof range === "function" || typeof range === "string") {
        return sheet.getRange(range);
    } else if (defaultRange) {
        return sheet.getRange(defaultRange);
    } else {
        return null;
    }
}

function createRanges(sheet: ISheet, ranges: IEntitySchemaRange): ReadyEntitySchemaRange {
    ranges = { ...ranges };
    const headersRange: IRange | null = initRange(sheet, ranges.headers);
    const row = headersRange ? headersRange.row + 1 : DEFAULT_DATA_RANGE.row;
    const column = headersRange ? headersRange.column : DEFAULT_DATA_RANGE.column;
    const rows = `${RangeTokens.MaxRows} - ${row - 1}`;
    const columns = headersRange ? headersRange.columns : DEFAULT_DATA_RANGE.columns;
    const dataRange = initRange(sheet, ranges.data, `${row}, ${column}, ${rows}, ${columns}`)!;

    return {
        headers: headersRange,
        data: dataRange,
    };
}

function createRepository<Entity extends Record<string, any> = Record<string, any>>(
    sheet: ISheet,
    ranges: IEntitySchemaRange,
    columns: EntitySchemaColumns<any>,
    strategies?: IDataStrategy<Entity>[],
) {
    const { headers, data } = createRanges(sheet, ranges);
    const rangeService = new RangeService(sheet, data);
    const map = new MapBuilder(columns, headers).getMap();
    const documentMapper = new DocumentMapper<Entity>(map, strategies);
    const dataMapper = new DataMapper<Entity>(documentMapper, strategies);
    const dataService = new DataService<Entity>(rangeService, dataMapper);
    return new Repository<Entity>(dataService, map);
}
