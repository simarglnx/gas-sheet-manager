import { DataMapperOperation, IDataMapper } from "@core/data-mapper/types/DataMapper";
import { IDataService } from "@core/data-service/types/DataService";
import { IRangeService } from "@core/range-service/types/RangeService";

export class DataService<Entity extends Record<string, any>> implements IDataService<Entity> {
    constructor(
        protected readonly rangeService: IRangeService,
        protected readonly dataMapper: IDataMapper<Entity>,
    ) {}

    get(operation?: DataMapperOperation<Entity>): Entity[] {
        const values = this.rangeService.getValues();
        return this.dataMapper.toEntities(values, operation);
    }

    set(index: number, value: Entity): void {}

    append(entities: Entity[]): void {
        if (entities.length < 1) return;
        const values = this.dataMapper.toData(entities);
        this.rangeService.appendValues(values);
    }

    sort(options: { column: number; ascending: boolean } | number): void {
        this.rangeService.sort(options);
    }

    clear(...indexes: number[]): void {
        if (indexes.length < 1) return;
        this.rangeService.clearRows(...indexes.map((index) => index + 1));
    }
}
