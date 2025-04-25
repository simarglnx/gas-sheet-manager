import { SheetManagerException } from "@errors/SheetManagerException";

export class InvalidRangeValues extends SheetManagerException {
    constructor() {
        super(`The array must store at least 1 drawing`);
    }
}
