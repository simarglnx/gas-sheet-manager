import { SheetManagerException } from "@errors/SheetManagerException";

export class DataOutOfRange extends SheetManagerException {
    constructor(initColumns: number, numColumns: number) {
        super(`Data out of range, columns available ${initColumns} used ${numColumns}`);
    }
}
