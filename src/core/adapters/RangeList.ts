import { Range } from "@core/adapters/Range";
import { Sheet } from "@core/adapters/Sheet";
import { IRangeList } from "@core/adapters/types/RangeList";
import { IRange } from "@core/adapters/types/Range";
import { GASRange, GASRangeList } from "@core/SheetManager";
import { ISheet } from "@core/adapters/types/Sheet";

export class RangeList implements IRangeList {
    static RangeConstructor: new (sheet: ISheet, range: GASRange) => IRange = Range;

    constructor(
        protected readonly sheet: Sheet,
        protected readonly rangeList: GASRangeList,
    ) {}

    public clearContent(): void {
        this.rangeList.clearContent();
        this.sheet.invalidateCache();
    }

    public getRanges(): IRange[] {
        return this.rangeList
            .getRanges()
            .map((range) => new RangeList.RangeConstructor(this.sheet, range));
    }
}
