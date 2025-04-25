import { SheetManagerException } from "@errors/SheetManagerException";

export class BadColumnSelector extends SheetManagerException {
    constructor(selector: string) {
        super(`Bad column selector, column ${selector} not found`);
    }
}
