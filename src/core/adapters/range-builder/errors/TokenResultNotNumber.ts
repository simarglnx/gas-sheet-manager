import { SheetManagerException } from "@errors/SheetManagerException";

export class TokenResultNotNumber extends SheetManagerException {
    constructor(token?: string | number) {
        const message = `The expression(${token}) did not give a number.`;
        super(message);
    }
}
