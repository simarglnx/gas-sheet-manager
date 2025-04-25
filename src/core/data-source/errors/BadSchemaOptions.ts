import { SheetManagerException } from "@errors/SheetManagerException";

export class BadSchemaOptions extends SheetManagerException {
    constructor(message?: string) {
        super(`Bad schema options: ${message}`);
    }
}
