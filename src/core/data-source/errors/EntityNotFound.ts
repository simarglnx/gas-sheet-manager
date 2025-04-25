import { SheetManagerException } from "@errors/SheetManagerException";

export class EntityNotFound extends SheetManagerException {
    constructor(selector?: string | number | null) {
        super(`Entity ${String(selector)} not found`);
    }
}
