import { DataSource } from "@core/data-source/DataSource";
import { IEntitySchemaOptions } from "@core/schema/types/EntitySchema";

export type GASSSpreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
export type GASSheet = GoogleAppsScript.Spreadsheet.Sheet;
export type GASRange = GoogleAppsScript.Spreadsheet.Range;
export type GASRangeList = GoogleAppsScript.Spreadsheet.RangeList;

export type SheetValues = SheetRowValues[];
export type SheetRowValues = SheetCellValue[];
export type SheetCellValue = string | number | Date;
export type SheetDisplayValues = string[][];

export function dataSource(options: {
    id?: string;
    entities: IEntitySchemaOptions<any>[];
}): DataSource {
    return new DataSource(options);
}

declare global {
    export namespace SheetManager {
        export function dataSource(options: {
            id?: string;
            entities: IEntitySchemaOptions<any>[];
        }): DataSource;
    }
}
