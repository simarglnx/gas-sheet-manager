import { DataStrategy } from "@core/data-mapper/strategies/DataStrategy";
import { IEntitySchema } from "@core/schema/types/EntitySchema";

export class TransformStrategy<Entity extends Record<string, any>> extends DataStrategy<Entity> {
    constructor(protected readonly schema: IEntitySchema<Entity>) {
        super();
    }

    toEntities(entity: Entity, index: number, abort: () => void): Entity {
        const transform = this.schema.transform?.from;
        if (typeof transform === "function") {
            return transform(entity);
        } else return entity;
    }

    toData(entity: Entity): Entity {
        const transform = this.schema.transform?.to;
        if (typeof transform === "function") {
            return transform(entity);
        } else return entity;
    }

    toEntity(value: any, key: string): any {
        const transform = this.schema.columns[key]?.transform?.from;
        if (typeof transform === "function") {
            return transform(value);
        } else return value;
    }

    toRow(value: any, key: string): any {
        const transform = this.schema.columns[key]?.transform?.to;
        if (typeof transform === "function") {
            return transform(value);
        } else return value;
    }
}
