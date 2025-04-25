import { SheetManagerException } from "@errors/SheetManagerException";

export class BadRangeSignature extends SheetManagerException {
    constructor(signature: string) {
        super(`Invalid range signature: ${signature} for Sheet.getRange()`);
    }
}
