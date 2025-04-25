export interface IRangeService {
    appendValues(values: any[][]): void;

    getValues(): any[][];

    invalidateRange(): void;

    clearRows(...rows: number[]): void;

    sort(options: { column: number; ascending: boolean } | number): void;
}
