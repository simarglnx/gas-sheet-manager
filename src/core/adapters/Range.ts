import { IRange } from "@core/adapters/types/Range";
import { ISheet } from "@core/adapters/types/Sheet";
import { GASRange } from "@core/SheetManager";

export class Range<Value> implements IRange<Value> {
    constructor(
        protected readonly sheet: ISheet,
        protected readonly range: GASRange,
    ) {}

    get row(): number {
        return this.range.getRow();
    }

    get column(): number {
        return this.range.getColumn();
    }

    get rows(): number {
        return this.range.getNumRows();
    }

    get columns(): number {
        return this.range.getNumColumns();
    }

    get lastRow(): number {
        return this.range.getLastRow();
    }

    get lastColumn(): number {
        return this.range.getLastColumn();
    }

    getValues(): Value[][] {
        return this.range.getValues();
    }

    setValues(values: Value[][]): void {
        this.range.setValues(values);
        this.sheet.invalidateCache();
    }

    getA1Notation(): string {
        return this.range.getA1Notation();
    }

    clearContent(): void {
        this.range.clearContent();
        this.sheet.invalidateCache();
    }

    sort(options: { column: number; ascending: boolean } | number): void {
        this.range.sort(options);
        this.sheet.invalidateCache();
    }
}
