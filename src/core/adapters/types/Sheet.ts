import { IRange } from "@core/adapters/types/Range";
import { IRangeList } from "@core/adapters/types/RangeList";
import { GASRange, GASSheet } from "@core/SheetManager";

export type RangeCallback = (sheet: GASSheet) => GASRange;
export type RangeBuilderTokens = [
    RangeCallback | number | string,
    number | string | undefined,
    number | string | undefined,
    number | string | undefined,
];

export interface ISheet {
    row: number;
    column: number;
    columns: number;
    rows: number;
    lastRow: number;
    lastColumn: number;

    getRange(a1Notation: string | RangeCallback): IRange;

    getRange(row: number | string, column: number | string): IRange;

    getRange(row: number | string, column: number | string, rows: number | string): IRange;

    getRange(
        row: number | string,
        column: number | string,
        rows: number | string,
        columns: number | string,
    ): IRange;

    getDataRange(): IRange;

    getRangeList(a1Notations: string[]): IRangeList;

    invalidateCache(): void;
}
