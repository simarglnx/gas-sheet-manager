import { EntitySchemaColumns } from "@core/schema/types/EntitySchema";
import { BadColumnSelector } from "@core/map-builder/errors/BadColumnSelector";
import { IRange } from "@core/adapters/types/Range";

export interface IMapBuilder<Entity extends Record<string, number>> {
    getMap(): Record<keyof Entity, number>;
}

export class MapBuilder<Entity extends Record<string, number>> implements IMapBuilder<Entity> {
    protected readonly headers: string[];

    constructor(
        protected readonly columns: EntitySchemaColumns<Entity>,
        headersRange?: IRange | null,
    ) {
        if (headersRange) {
            this.headers = headersRange.getValues()[0].map((el) => String(el));
        } else this.headers = [];
    }

    getMap(): Record<keyof Entity, number> {
        const headers = this.headers;
        const map: Record<keyof Entity, number> = {} as Record<keyof Entity, number>;
        for (const key in this.columns) {
            const column = this.columns[key];
            const selector = column.selector;
            if (typeof selector === "number") {
                map[key] = selector;
            } else {
                const index = headers.indexOf(selector);
                if (index === -1) throw new BadColumnSelector(selector);
                else map[key] = index;
            }
        }
        return map;
    }
}
