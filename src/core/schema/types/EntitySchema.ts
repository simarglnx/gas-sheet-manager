import { GASRange, GASSheet } from "@core/SheetManager";

export type OptionRange = string | ((sheet: GASSheet) => GASRange) | null;

export interface IEntitySchema<Entity extends Record<string, any>, Value = any> {
    selector: string | number;
    ranges: IEntitySchemaRange;
    columns: Record<keyof Entity, IEntitySchemaColumn<Value>>;
    transform: EntitySchemaTransform<Entity>;
}

export interface IEntitySchemaOptions<Entity extends Record<string, any>, Value = any> {
    selector: string | number;
    ranges?: IEntitySchemaRange;
    columns: Record<keyof Entity, EntitySchemaOptionsColumn<Value>>;
    transform?: Partial<EntitySchemaTransform<Entity>> | null;
}

export interface IEntitySchemaRange {
    headers?: OptionRange;
    data?: OptionRange;
}

export interface IEntitySchemaColumn<Value> {
    selector: string | number;
    primary: boolean;
    transform: EntitySchemaTransform<Value>;
}

export type EntitySchemaTransform<Value> = {
    to: ((value: Value) => Value) | null;
    from: ((value: Value) => Value) | null;
};

export type EntitySchemaColumns<Entity extends Record<string, any>, Value = any> = Record<
    keyof Entity,
    IEntitySchemaColumn<Value>
>;
export type EntitySchemaOptionsColumn<Value> =
    | {
          selector: string | number;
          primary?: boolean;
          transform: Partial<EntitySchemaTransform<Value>> | null;
      }
    | string
    | number;
