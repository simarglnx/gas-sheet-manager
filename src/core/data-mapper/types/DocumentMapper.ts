export interface IDocumentStrategy {
    toEntity(value: any, key: string): any;

    toRow(value: any, key: string): any;
}

export interface IDocumentMapper<Entity> {
    toEntity(row: any[]): Entity;

    toRow(entity: Entity): any[];
}
