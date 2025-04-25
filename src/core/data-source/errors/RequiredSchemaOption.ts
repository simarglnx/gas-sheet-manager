import { BadSchemaOptions } from "@core/data-source/errors/BadSchemaOptions";

export class RequiredSchemaOption extends BadSchemaOptions {
    constructor(property: string) {
        super(`${property} is required!`);
    }
}
