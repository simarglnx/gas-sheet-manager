import { SheetManagerException } from "@errors/SheetManagerException";

export class IncorrectSelectorSheet extends SheetManagerException {
    constructor(selector?: string | number) {
        const message = `Sheet by selector(${String(selector)} not found`;
        super(message);
    }
}
