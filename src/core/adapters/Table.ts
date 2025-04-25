import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { Sheet } from "@core/adapters/Sheet";
import { ITable } from "@core/adapters/types/Table";

import { IncorrectTableId } from "@core/adapters/errors/IncorrectTableId";
import { IncorrectSelectorSheet } from "@core/adapters/errors/IncorrectSelectorSheet";

export class Table implements ITable {
    public id: string;
    protected spreadsheet: Spreadsheet;

    constructor(id?: string) {
        try {
            if (id) this.spreadsheet = SpreadsheetApp.openById(id);
            else this.spreadsheet = SpreadsheetApp.getActive();
            this.id = id ? id : this.spreadsheet.getId();
        } catch (e: unknown) {
            throw new IncorrectTableId(id);
        }
    }

    public getSheet(selector: string | number): Sheet {
        const spreadsheet = this.spreadsheet;
        let sheet = null;

        if (typeof selector === "string") {
            sheet = spreadsheet.getSheetByName(selector);
        } else {
            sheet = spreadsheet.getSheets()[selector];
        }

        if (sheet) return new Sheet(sheet);
        else throw new IncorrectSelectorSheet(selector);
    }
}
