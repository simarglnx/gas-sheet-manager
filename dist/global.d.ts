type OptionRange = string | ((sheet: GASSheet) => GASRange) | null;
interface IEntitySchemaOptions<Entity extends Record<string, any>, Value = any> {
    selector: string | number;
    ranges?: IEntitySchemaRange;
    columns: Record<keyof Entity, EntitySchemaOptionsColumn<Value>>;
    transform?: Partial<EntitySchemaTransform<Entity>> | null;
}
interface IEntitySchemaRange {
    headers?: OptionRange;
    data?: OptionRange;
}
type EntitySchemaTransform<Value> = {
    to: ((value: Value) => Value) | null;
    from: ((value: Value) => Value) | null;
};
type EntitySchemaOptionsColumn<Value> = {
    selector: string | number;
    primary?: boolean;
    transform: Partial<EntitySchemaTransform<Value>> | null;
} | string | number;

interface IRange<Value = any> {
    row: number;
    column: number;
    rows: number;
    columns: number;
    lastRow: number;
    lastColumn: number;
    getValues(): Value[][];
    setValues(values: Value[][]): void;
    getA1Notation(): string;
    sort(options: {
        column: number;
        ascending: boolean;
    } | number): void;
    clearContent(): void;
}

interface IRangeList {
    clearContent(): void;
}

type RangeCallback = (sheet: GASSheet) => GASRange;
interface ISheet {
    row: number;
    column: number;
    columns: number;
    rows: number;
    lastRow: number;
    lastColumn: number;
    getRange(a1Notation: string | RangeCallback): IRange;
    getRange(row: number | string, column: number | string): IRange;
    getRange(row: number | string, column: number | string, rows: number | string): IRange;
    getRange(row: number | string, column: number | string, rows: number | string, columns: number | string): IRange;
    getDataRange(): IRange;
    getRangeList(a1Notations: string[]): IRangeList;
    invalidateCache(): void;
}

interface ITable {
    getSheet(selector: number | string): ISheet;
}

declare enum FindOperator {
    GTE = "$gte",
    LTE = "$lte",
    GT = "$gt",
    LT = "$lt",
    NE = "$ne",
    IN = "$in",
    NIN = "$nin"
}
declare enum FindObjectOperator {
    OR = "$or",
    AND = "$and"
}
type Primitive = string | number | boolean | null | undefined;
type FindOperatorObject<Value> = {
    [key in FindOperator]?: key extends FindOperator.IN | FindOperator.NIN ? Value[] : Value;
};
type FindOperatorValue<Value> = FindOperatorObject<Value> | Value;
type FindObjectConditions<Entity extends Record<string, any>, Value> = {
    [K in keyof Entity]?: FindOperatorValue<Value>;
};
type FindObjectOperations<Entity extends Record<string, any>, Value> = {
    [K in FindObjectOperator]?: FindObject<Entity, Value>[];
};
type FindObject<Entity extends Record<string, any>, Value = Primitive | Date> = FindObjectConditions<Entity, Value> | FindObjectOperations<Entity, Value>;

type RepositoryDeleteResult = {
    deleted: boolean;
    counter: number;
    indexes: number[];
};
interface IRepository<Entity extends Record<string, any>> {
    find(findObject: FindObject<Entity>): Entity[];
    findOne(findObject: FindObject<Entity>): Entity | null;
    findAndDelete(findObject: FindObject<Entity>): RepositoryDeleteResult;
    deleteOne(findObject: FindObject<Entity>): RepositoryDeleteResult;
    insert(entity: Entity): void;
    insertMany(entities: Entity[]): void;
    sort(key?: string, ascending?: boolean): void;
}

interface IDataSource {
}
declare class DataSource implements IDataSource {
    protected readonly id: string | null;
    protected readonly entities: Map<string | number, IEntitySchema<any>>;
    protected readonly repositories: Map<string | number, IRepository<any>>;
    protected table: ITable | null;
    constructor(options?: {
        id?: string;
        entities?: IEntitySchemaOptions<any>[];
    });
    getRepository<Entity extends Record<string, any> = Record<string, any>>(selector: string | number): IRepository<Entity>;
    protected _getSource(): ITable;
}

type GASSSpreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
type GASSheet = GoogleAppsScript.Spreadsheet.Sheet;
type GASRange = GoogleAppsScript.Spreadsheet.Range;
type GASRangeList = GoogleAppsScript.Spreadsheet.RangeList;
type SheetValues = SheetRowValues[];
type SheetRowValues = SheetCellValue[];
type SheetCellValue = string | number | Date;
type SheetDisplayValues = string[][];
declare function dataSource(options: {
    id?: string;
    entities: IEntitySchemaOptions<any>[];
}): DataSource;
declare global {
    export namespace SheetManager {
        function dataSource(options: {
            id?: string;
            entities: IEntitySchemaOptions<any>[];
        }): DataSource;
    }
}

export { dataSource };
export type { GASRange, GASRangeList, GASSSpreadsheet, GASSheet, SheetCellValue, SheetDisplayValues, SheetRowValues, SheetValues };
