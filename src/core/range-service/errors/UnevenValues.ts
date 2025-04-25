import { SheetManagerException } from "@errors/SheetManagerException";

export class UnevenValues extends SheetManagerException {
    constructor() {
        super(`Values rows of different sizes`);
    }
}
