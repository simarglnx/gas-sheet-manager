import {
    FindObject,
    FindObjectOperator,
    FindOperator,
    FindOperatorValue,
    IFindBuilder,
} from "@core/repository/types/FindBuilder";

export class FindBuilder<Entity extends Record<string, any>, Value>
    implements IFindBuilder<Entity>
{
    protected readonly _compareOperation: (entity: Entity) => boolean;

    constructor(protected readonly _findObject: FindObject<Entity, Value>) {
        this._compareOperation = this._buildCompareOperation(_findObject);
    }

    compare(entities: Entity | Entity[]): boolean {
        if (Array.isArray(entities)) {
            return entities.every((entity) => this.compare(entity));
        } else return this._compareOperation(entities);
    }

    protected _resolveCondition(value: Value, conditions: FindOperatorValue<Value>): boolean {
        if (typeof conditions !== "object" || conditions === null) {
            return value === conditions;
        } else {
            for (const operation in conditions) {
                if (!Object.values(FindOperator).includes(operation as any)) continue;
                const conditionValue = (conditions as any)[operation];
                switch (operation) {
                    case FindOperator.GTE:
                        if (!(value >= conditionValue)) return false;
                        break;
                    case FindOperator.LTE:
                        if (!(value <= conditionValue)) return false;
                        break;
                    case FindOperator.GT:
                        if (!(value > conditionValue)) return false;
                        break;
                    case FindOperator.LT:
                        if (!(value < conditionValue)) return false;
                        break;
                    case FindOperator.NE:
                        if (!(value !== conditionValue)) return false;
                        break;
                    case FindOperator.IN:
                        if (!(Array.isArray(conditionValue) && conditionValue.includes(value)))
                            return false;
                        break;
                    case FindOperator.NIN:
                        if (!(Array.isArray(conditionValue) && !conditionValue.includes(value)))
                            return false;
                        break;
                }
            }
            return true;
        }
    }

    private _buildCompareOperation(
        findObject: FindObject<Entity, Value>,
    ): (entity: Entity) => boolean {
        let directConditions: ((entity: Entity) => boolean)[] = [];
        let andOperations: ((entity: Entity) => boolean)[] = [];
        let orOperations: ((entity: Entity) => boolean)[] | null = null;

        for (const [key, conditions] of Object.entries(findObject)) {
            if (conditions !== undefined) {
                if (key === FindObjectOperator.OR && Array.isArray(conditions)) {
                    orOperations = conditions.map((condition) => {
                        return this._buildCompareOperation(condition);
                    });
                } else if (key === FindObjectOperator.AND && Array.isArray(conditions)) {
                    andOperations = conditions.map((condition) => {
                        return this._buildCompareOperation(condition);
                    });
                } else {
                    if (!directConditions) directConditions = [];
                    directConditions.push((entity: Entity) =>
                        this._resolveCondition(entity[key], conditions),
                    );
                }
            }
        }

        return (entity: Entity) => {
            const directResult = directConditions.every((op) => op(entity));
            if (!directResult) return false;

            const andResult = andOperations.every((op) => op(entity));
            if (!andResult) return false;

            return orOperations !== null ? orOperations.some((op) => op(entity)) : true;
        };
    }
}
