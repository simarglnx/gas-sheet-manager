import { IDocumentMapper, IDocumentStrategy } from "@core/data-mapper/types/DocumentMapper";

export class DocumentMapper<Entity extends Record<string, any>> implements IDocumentMapper<Entity> {
    constructor(
        protected readonly map: Record<keyof Entity, number>,
        protected readonly strategies: IDocumentStrategy[] = [],
    ) {}

    public toEntity(row: any[]): Entity {
        const entity = {} as Entity;
        for (const key in this.map) {
            const cursor = this.map[key];
            let value = row[cursor];

            value = this.strategies.reduce((val, strategy) => strategy.toEntity(val, key), value);
            entity[key] = value as any;
        }
        return entity;
    }

    public toRow(entity: Entity): any[] {
        const indexes: number[] = Object.values(this.map);
        const maxIndex = Math.max(...indexes);
        const row = new Array(maxIndex + 1).fill("");

        for (const key in entity) {
            const cursor = this.map[key];
            let value = entity[key];

            value = this.strategies.reduce((val, strategy) => strategy.toRow(val, key), value);
            row[cursor] = value;
        }
        return row;
    }
}
