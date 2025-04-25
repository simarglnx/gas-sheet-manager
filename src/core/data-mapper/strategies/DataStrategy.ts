import { IDataStrategy } from "@core/data-mapper/types/DataMapper";
import { DocumentStrategy } from "@core/data-mapper/strategies/DocumentStrategy";

export class DataStrategy<Entity extends Record<string, any>>
    extends DocumentStrategy
    implements IDataStrategy<Entity>
{
    toData(entity: Entity): Entity {
        return entity;
    }

    toEntities(entity: Entity, index: number, abort: () => void): Entity {
        return entity;
    }
}
