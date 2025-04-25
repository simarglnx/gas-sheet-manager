import { IRangeService } from "@core/range-service/types/RangeService";
import { ISheet, RangeCallback } from "@core/adapters/types/Sheet";
import { IRange } from "@core/adapters/types/Range";
import { Range } from "@core/adapters/Range";
import { RangeTokens } from "@core/adapters/range-builder/RangeBuilder";
import { DataOutOfRange } from "@core/range-service/errors/DataOutOfRange";
import { InvalidRangeValues } from "@core/range-service/errors/InvalidRangeValues";
import { UnevenValues } from "@core/range-service/errors/UnevenValues";

const DEFAULT_RANGE = `1, 1, ${RangeTokens.MaxRows}, ${RangeTokens.MaxColumns}`;

export class RangeService implements IRangeService {
    protected _range: IRange;
    protected _defaultRange: string = `1, 1, ${RangeTokens.MaxRows}, ${RangeTokens.MaxColumns}`;

    constructor(
        private readonly sheet: ISheet,
        initRange?: IRange | RangeCallback | string | null,
        defaultRange?: string,
    ) {
        this._defaultRange = defaultRange || DEFAULT_RANGE;

        if (typeof initRange === "function" || typeof initRange === "string") {
            this._range = this.sheet.getRange(initRange);
        } else if (initRange instanceof Range) {
            this._range = initRange;
        } else {
            this._range = this.sheet.getRange(this._defaultRange);
        }
    }

    getValues(): any[][] {
        return this._range.getValues();
    }

    appendValues(values: any[][]): void {
        if (values.length < 1) return;
        this.invalidateRange();
        const initColumn = this._range.column;
        const initColumns = this._range.columns;
        const numRows = values.length;
        const numColumns = values[0].length;
        if (numColumns > initColumns) throw new DataOutOfRange(initColumns, numColumns);
        else if (values.length < 1) throw new InvalidRangeValues();
        else if (values.some((row) => row.length !== values[0].length)) throw new UnevenValues();
        else {
            this.sheet
                .getRange(`${RangeTokens.LastRow} + 1`, initColumn, numRows, numColumns)
                .setValues(values);
        }
    }

    sort(options?: { column?: number; ascending?: boolean } | number): void {
        this.invalidateRange();
        const columnOffset = this._range.column - 1;
        let column: number;
        let ascending: boolean;

        if (typeof options === "object") {
            column = options.column ? options.column + columnOffset : this._range.column;
            ascending = options.ascending || false;
        } else {
            column = options ? options + columnOffset : this._range.column;
            ascending = false;
        }

        this._range.sort({ column, ascending });
    }

    clearRows(...rows: number[]): void {
        this.invalidateRange();
        const initColumn = this._range.column;
        const initColumns = this._range.columns;
        const rangeList = [];
        const offset = this._range.row - 1;
        for (const rowNum of rows) {
            const rowRange = this.sheet.getRange(rowNum + offset, initColumn, 1, initColumns);
            rangeList.push(rowRange.getA1Notation());
        }
        this.sheet.getRangeList(rangeList).clearContent();
    }

    invalidateRange(): void {
        const initRow = this._range.row;
        const initColumn = this._range.column;
        const initColumns = this._range.columns;
        const offset = initRow - 1;
        const rowsToken = `${RangeTokens.MaxRows} - ${offset}`;
        this._range = this.sheet.getRange(initRow, initColumn, rowsToken, initColumns);
    }
}
