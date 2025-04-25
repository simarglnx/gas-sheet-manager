import { SheetManagerException } from "@errors/SheetManagerException";

export class SelectorRequired extends SheetManagerException {
    constructor(selector?: string | number) {
        const message = `Selector is required`;
        super(message);
    }
}
