import { IDataService } from "@core/data-service/types/DataService";
import { IRepository, RepositoryDeleteResult } from "@core/repository/types/Repository";
import { FindBuilder } from "@core/repository/FindBuilder";
import { FindBuilderConstructor, FindObject } from "@core/repository/types/FindBuilder";

export class Repository<Entity extends Record<string, any>> implements IRepository<Entity> {
    static FindBuilderConstructor: FindBuilderConstructor = FindBuilder;

    constructor(
        protected readonly dataService: IDataService<Entity>,
        protected readonly map: Record<keyof Entity, number>,
    ) {}

    find(findObject: FindObject<Entity>): Entity[] {
        const finder = new Repository.FindBuilderConstructor(findObject);
        const result: Entity[] = [];
        this.dataService.get((entity) => {
            if (finder.compare(entity)) result.push(entity);
        });
        return result;
    }

    findOne(findObject: FindObject<Entity>): Entity | null {
        const finder = new Repository.FindBuilderConstructor(findObject);
        let result: Entity | null = null;
        this.dataService.get((entity, index, abort) => {
            if (finder.compare(entity)) {
                result = entity;
                abort();
            }
        });
        return result;
    }

    findAndDelete(findObject: FindObject<Entity>): RepositoryDeleteResult {
        const finder = new Repository.FindBuilderConstructor(findObject);
        let indexes: number[] = [];

        this.dataService.get((entity, index, abort) => {
            if (finder.compare(entity)) indexes.push(index);
        });
        this.dataService.clear(...indexes);

        return {
            deleted: Boolean(indexes.length),
            indexes: indexes,
            counter: indexes.length,
        };
    }

    insert(entity: Entity): void {
        this.insertMany([entity]);
    }

    insertMany(entities: Entity[]): void {
        if (entities.length < 1) return;
        this.dataService.append(entities);
    }

    sort(key?: string, ascending?: boolean): void {
        const columnIndex: number = key && key in this.map ? this.map[key] + 1 : 1;
        this.dataService.sort({
            column: columnIndex,
            ascending: typeof ascending === "boolean" ? ascending : false,
        });
    }

    deleteOne(findObject: FindObject<Entity>): RepositoryDeleteResult {
        const finder = new Repository.FindBuilderConstructor(findObject);
        let indexes: number[] = [];

        this.dataService.get((entity, index, abort) => {
            if (finder.compare(entity)) {
                indexes.push(index);
                abort();
            }
        });
        this.dataService.clear(...indexes);

        return {
            deleted: Boolean(indexes.length),
            indexes: indexes,
            counter: indexes.length,
        };
    }
}
