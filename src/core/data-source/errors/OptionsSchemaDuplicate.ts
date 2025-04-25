import { SheetManagerException } from "@errors/SheetManagerException";

export class OptionsSchemaDuplicate extends SheetManagerException {
    constructor(selector?: string | number | null) {
        super(`Such a scheme${String(selector) || ""} already exists `);
    }
}
