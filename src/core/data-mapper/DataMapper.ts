import {
    DataMapperOperation,
    IDataMapper,
    IDataStrategy,
} from "@core/data-mapper/types/DataMapper";
import { IDocumentMapper } from "@core/data-mapper/types/DocumentMapper";

export class DataMapper<Entity extends Record<string, any>> implements IDataMapper<Entity> {
    constructor(
        protected readonly documentMapper: IDocumentMapper<Entity>,
        protected readonly strategies: IDataStrategy<Entity>[] = [],
    ) {}

    toEntities(data: any[], operation?: DataMapperOperation<Entity>): Entity[] {
        const result: Entity[] = [];
        data.some((row, index) => {
            const abort = () => (aborted = true);
            let entity = this.documentMapper.toEntity(row);
            let aborted = false;

            this.strategies.forEach((strategy) => {
                entity = strategy.toEntities(entity, index, abort);
            });

            if (typeof operation === "function") operation(entity, index, abort);

            if (!aborted) result.push(entity);
            return aborted;
        });
        return result;
    }

    toData(entities: Entity[]): any[][] {
        return entities.map((entity, index) => {
            entity = this.strategies.reduce((en, strategy) => strategy.toData(en, index), {
                ...entity,
            });
            return this.documentMapper.toRow(entity);
        });
    }
}
