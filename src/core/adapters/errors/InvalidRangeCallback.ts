import { SheetManagerException } from "@errors/SheetManagerException";

export class InvalidRangeCallback extends SheetManagerException {
    constructor() {
        super(`Range callback is not function`);
    }
}
