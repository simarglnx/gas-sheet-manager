import { FindObject } from "@core/repository/types/FindBuilder";

export type RepositoryDeleteResult = {
    deleted: boolean;
    counter: number;
    indexes: number[];
};

export interface IRepository<Entity extends Record<string, any>> {
    find(findObject: FindObject<Entity>): Entity[];

    findOne(findObject: FindObject<Entity>): Entity | null;

    findAndDelete(findObject: FindObject<Entity>): RepositoryDeleteResult;

    deleteOne(findObject: FindObject<Entity>): RepositoryDeleteResult;

    insert(entity: Entity): void;

    insertMany(entities: Entity[]): void;

    sort(key?: string, ascending?: boolean): void;
}
