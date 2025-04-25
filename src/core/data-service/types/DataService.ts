import { DataMapperOperation } from "@core/data-mapper/types/DataMapper";

export interface IDataService<Entity extends Record<string, any>> {
    get(operation?: DataMapperOperation<Entity>): Entity[];

    clear(...indexes: number[]): void;

    sort(options: { column: number; ascending: boolean } | number): void;

    append(entities: Entity[]): void;
}
