import { ISheet } from "@core/adapters/types/Sheet";

export interface ITable {
    getSheet(selector: number | string): ISheet;
}
