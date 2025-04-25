import { GASRange, GASSheet, SheetValues } from "@core/SheetManager";
import { RangeList } from "@core/adapters/RangeList";
import { ISheet, RangeCallback } from "@core/adapters/types/Sheet";
import { RangeBuilder, RangeTokens } from "@core/adapters/range-builder/RangeBuilder";
import { IRange } from "@core/adapters/types/Range";
import { Range } from "@core/adapters/Range";
import { IRangeBuilder } from "@core/adapters/range-builder/types/RangeBuilder";

export class Sheet implements ISheet {
    static RangeConstructor: new (sheet: ISheet, range: GASRange) => IRange = Range;
    static RangeBuilderConstructor: new (sheet: GASSheet) => IRangeBuilder = RangeBuilder;
    row: number = 1;
    column: number = 1;

    constructor(protected readonly sheet: GASSheet) {}

    protected _lastColumn: number | null = null;

    get lastColumn(): number {
        return (this._lastColumn = this._lastColumn ?? this.sheet.getLastColumn());
    }

    protected _lastRow: number | null = null;

    get lastRow(): number {
        return (this._lastRow = this._lastRow ?? this.sheet.getLastRow());
    }

    protected _rows: number | null = null;

    get rows(): number {
        return (this._rows = this._rows ?? this.sheet.getMaxRows());
    }

    protected _columns: number | null = null;

    get columns(): number {
        return (this._columns = this._columns ?? this.sheet.getMaxColumns());
    }

    getName(): string {
        return this.sheet.getName();
    }

    getRangeList(a1Notations: string[]) {
        const rangeList = this.sheet.getRangeList(a1Notations);
        return new RangeList(this, rangeList);
    }

    getValues(): SheetValues {
        return this.getRange(
            this.row,
            this.column,
            RangeTokens.MaxRows,
            RangeTokens.MaxColumns,
        ).getValues();
    }

    invalidateCache(): void {
        this._columns = null;
        this._rows = null;
        this._lastRow = null;
        this._lastColumn = null;
    }

    getRange(a1Notation: string | RangeCallback): IRange;
    getRange(row: number | string, column: number | string): IRange;
    getRange(row: number | string, column: number | string, rows: number | string): IRange;
    getRange(
        row: number | string,
        column: number | string,
        rows: number | string,
        columns: number | string,
    ): IRange;
    getRange(
        a1Notation: string | RangeCallback | number,
        column?: number | string,
        rows?: number | string,
        columns?: number | string,
    ): IRange {
        const rangeBuilder = new Sheet.RangeBuilderConstructor(this.sheet);
        const range = rangeBuilder.getRange(a1Notation, column, rows, columns);
        return new Sheet.RangeConstructor(this, range);
    }

    getDataRange(): IRange {
        return new Sheet.RangeConstructor(this, this.sheet.getDataRange());
    }
}
