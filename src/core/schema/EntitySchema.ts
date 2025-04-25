import {
    EntitySchemaColumns,
    EntitySchemaTransform,
    IEntitySchema,
    IEntitySchemaOptions,
    IEntitySchemaRange,
} from "@core/schema/types/EntitySchema";
import { EntitySchemaColumn } from "@core/schema/EntitySchemaColumn";

export class EntitySchema<Entity extends Record<string, any>, Value = any>
    implements IEntitySchema<Entity, Value>
{
    public readonly columns: EntitySchemaColumns<Entity, Value>;
    public readonly ranges: IEntitySchemaRange;
    public readonly selector: string | number;
    public readonly transform: EntitySchemaTransform<Entity> = { from: null, to: null };

    constructor(options: IEntitySchemaOptions<Entity, Value>) {
        this.selector = options.selector;
        this.transform.to = options.transform?.to ?? null;
        this.transform.from = options.transform?.from ?? null;
        this.ranges = options.ranges || { headers: null, data: null };

        const columns = {} as EntitySchemaColumns<Entity>;
        for (const key in options.columns) {
            const column = options.columns[key];
            columns[key] = new EntitySchemaColumn(column);
        }
        this.columns = columns;
    }
}
