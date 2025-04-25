export interface IRange<Value = any> {
    row: number;
    column: number;
    rows: number;
    columns: number;
    lastRow: number;
    lastColumn: number;

    getValues(): Value[][];

    setValues(values: Value[][]): void;

    getA1Notation(): string;

    sort(options: { column: number; ascending: boolean } | number): void;

    clearContent(): void;
}
