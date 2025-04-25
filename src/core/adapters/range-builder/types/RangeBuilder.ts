import { RangeCallback } from "@core/adapters/types/Sheet";
import { GASRange } from "@core/SheetManager";

export interface IRangeBuilder {
    getRange(
        tokenRow: RangeCallback | string | number,
        tokenColumn?: string | number,
        tokenRows?: string | number,
        tokenColumns?: string | number,
    ): GASRange;
}
