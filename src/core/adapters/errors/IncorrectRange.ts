import { SheetManagerException } from "@errors/SheetManagerException";

export class IncorrectRange extends SheetManagerException {
    constructor(row?: number | string, column?: number, rows?: number, columns?: number) {
        const argString = `${[row, column, rows, columns].map((arg) => (arg ? arg : "")).join(",")}`;
        const message = `Incorrect range values. Sheet.getRange(${argString})`;
        super(message);
    }
}
