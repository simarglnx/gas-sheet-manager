export enum FindOperator {
    GTE = "$gte",
    LTE = "$lte",
    GT = "$gt",
    LT = "$lt",
    NE = "$ne",
    IN = "$in",
    NIN = "$nin",
}

export enum FindObjectOperator {
    OR = "$or",
    AND = "$and",
}

export type Primitive = string | number | boolean | null | undefined;

export type FindOperatorObject<Value> = {
    [key in FindOperator]?: key extends FindOperator.IN | FindOperator.NIN ? Value[] : Value;
};
export type FindOperatorValue<Value> = FindOperatorObject<Value> | Value;

export type FindObjectConditions<Entity extends Record<string, any>, Value> = {
    [K in keyof Entity]?: FindOperatorValue<Value>;
};

export type FindObjectOperations<Entity extends Record<string, any>, Value> = {
    [K in FindObjectOperator]?: FindObject<Entity, Value>[];
};

export type FindObject<Entity extends Record<string, any>, Value = Primitive | Date> =
    | FindObjectConditions<Entity, Value>
    | FindObjectOperations<Entity, Value>;

export interface IFindBuilder<Entity extends Record<string, any>> {
    compare(entities: Entity | Entity[]): boolean;
}

export type FindBuilderConstructor = new <Entity extends Record<string, any>>(
    findObject: FindObject<Entity>,
) => IFindBuilder<Entity>;
