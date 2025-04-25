import { TokenResultNotNumber } from "@core/adapters/range-builder/errors/TokenResultNotNumber";
import { IRangeBuilder } from "@core/adapters/range-builder/types/RangeBuilder";

import { BadRangeSignature } from "@core/adapters/errors/BadRangeSignature";
import { GASRange, GASSheet } from "@core/SheetManager";
import { RangeCallback } from "@core/adapters/types/Sheet";

export enum RangeTokens {
    MaxRows = "mr",
    MaxColumns = "mc",
    LastRow = "lr",
    LastColumn = "lc",
}

export class RangeBuilder implements IRangeBuilder {
    constructor(protected readonly sheet: GASSheet) {}

    protected _lastColumn: number | null = null;

    get lastColumn(): number {
        return (this._lastColumn = this._lastColumn ?? this.sheet.getLastColumn());
    }

    protected _lastRow: number | null = null;

    get lastRow(): number {
        return (this._lastRow = this._lastRow ?? this.sheet.getLastRow());
    }

    protected _rows: number | null = null;

    get rows(): number {
        return (this._rows = this._rows ?? this.sheet.getMaxRows());
    }

    protected _columns: number | null = null;

    get columns(): number {
        return (this._columns = this._columns ?? this.sheet.getMaxColumns());
    }

    static isToken(...tokens: any[]): boolean {
        const isTokens: boolean[] = [...tokens].map((token) => {
            token = String(token);
            return Boolean(
                token.includes(RangeTokens.LastRow) ||
                    token.includes(RangeTokens.LastColumn) ||
                    token.includes(RangeTokens.MaxRows) ||
                    token.includes(RangeTokens.MaxColumns),
            );
        });

        return isTokens.includes(true);
    }

    getRange(
        tokenRow: RangeCallback | number | string,
        tokenColumn?: number | string,
        tokenRows?: number | string,
        tokenColumns?: number | string,
    ): GASRange {
        if (typeof tokenRow === "string" && tokenRow.includes(",")) {
            let [row, column, rows, columns] = tokenRow.split(",") as (string | number)[];
            row = Number(row) || row;
            column = Number(column) || column;
            rows = Number(rows) || rows;
            columns = Number(columns) || columns;
            return this.getRange(row, column, rows, columns);
        }

        const tokens = [tokenRow, tokenColumn, tokenRows, tokenColumns];
        const rangeArguments: [number, number, number, number] = [0, 0, 0, 0];
        const signature = tokens
            .map((token) => (RangeBuilder.isToken(token) ? "token" : typeof token))
            .join(",");

        if (typeof tokenRow === "function") {
            return tokenRow(this.sheet);
        } else if (tokenRow && tokenColumn) {
            rangeArguments[0] = this._resolveToken(tokenRow);
            rangeArguments[1] = this._resolveToken(tokenColumn);
            rangeArguments[2] = this._resolveToken(tokenRows || 1);
            rangeArguments[3] = this._resolveToken(tokenColumns || 1);
        } else if (typeof tokenRow === "string" && isNaN(Number(tokenRow))) {
            return this.sheet.getRange(tokenRow);
        } else {
            throw new BadRangeSignature(signature);
        }

        if (rangeArguments.includes(0)) throw new BadRangeSignature(signature);
        return this.sheet.getRange(...rangeArguments);
    }

    protected _resolveToken(token: string | number): number {
        if (typeof token === "number") return token;
        const { LastRow, LastColumn, MaxRows, MaxColumns } = RangeTokens;
        const regLastRow = new RegExp(`\\b${LastRow}\\b`, "g"),
            regLastColumn = new RegExp(`\\b${LastColumn}\\b`, "g"),
            regMaxRows = new RegExp(`\\b${MaxRows}\\b`, "g"),
            regMaxColumns = new RegExp(`\\b${MaxColumns}\\b`, "g");

        if (token.includes(LastRow)) {
            token = token.replace(regLastRow, this.lastRow.toString());
        }

        if (token.includes(LastColumn)) {
            token = token.replace(regLastColumn, this.lastColumn.toString());
        }

        if (token.includes(MaxRows)) {
            token = token.replace(regMaxRows, this.rows.toString());
        }

        if (token.includes(MaxColumns)) {
            token = token.replace(regMaxColumns, this.columns.toString());
        }

        const result = Function(`"use strict"; return (${token});`)();
        if (typeof result !== "number" || isNaN(result)) throw new TokenResultNotNumber(token);
        return result;
    }
}
