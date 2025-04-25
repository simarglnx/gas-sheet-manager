import {
    EntitySchemaOptionsColumn,
    EntitySchemaTransform,
    IEntitySchemaColumn,
} from "@core/schema/types/EntitySchema";
import { SelectorRequired } from "@core/schema/errors/SelectorRequired";

export class EntitySchemaColumn<Value> implements IEntitySchemaColumn<Value> {
    public readonly primary: boolean;
    public readonly selector: string | number;
    public readonly transform: EntitySchemaTransform<Value> = { from: null, to: null };

    constructor(column: EntitySchemaOptionsColumn<Value>) {
        if (typeof column === "object") {
            if (column.selector === undefined) throw new SelectorRequired();
            this.selector = column.selector;
            this.primary = column.primary ?? false;
            this.transform.to = column.transform?.to ?? null;
            this.transform.from = column.transform?.from ?? null;
        } else {
            this.primary = false;
            this.selector = column;
        }
    }
}
