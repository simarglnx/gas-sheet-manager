import { IDocumentStrategy } from "@core/data-mapper/types/DocumentMapper";

export type DataMapperOperation<Entity extends Record<string, any>> = (
    entity: Entity,
    index: number,
    abort: () => void,
) => void;

export interface IDataStrategy<Entity extends Record<string, any>> extends IDocumentStrategy {
    toEntities(entity: Entity, index: number, abort: () => void): Entity;

    toData(entity: Entity, index: number): Entity;
}

export interface IDataMapper<Entity extends Record<string, any>> {
    toEntities(data: any[], operation?: DataMapperOperation<Entity>): Entity[];

    toData(entities: Entity[]): any[][];
}
