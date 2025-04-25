import { SheetManagerException } from "@errors/SheetManagerException";

export class IncorrectTableId extends SheetManagerException {
    constructor(id?: string) {
        const message = `Table by id(${String(id)}) not found`;
        super(message);
    }
}
