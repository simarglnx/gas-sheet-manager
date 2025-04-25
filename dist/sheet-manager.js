var SheetManager = (function (exports) {
    'use strict';

    class DocumentMapper {
        constructor(map, strategies = []) {
            this.map = map;
            this.strategies = strategies;
        }
        toEntity(row) {
            const entity = {};
            for (const key in this.map) {
                const cursor = this.map[key];
                let value = row[cursor];
                value = this.strategies.reduce((val, strategy) => strategy.toEntity(val, key), value);
                entity[key] = value;
            }
            return entity;
        }
        toRow(entity) {
            const indexes = Object.values(this.map);
            const maxIndex = Math.max(...indexes);
            const row = new Array(maxIndex + 1).fill("");
            for (const key in entity) {
                const cursor = this.map[key];
                let value = entity[key];
                value = this.strategies.reduce((val, strategy) => strategy.toRow(val, key), value);
                row[cursor] = value;
            }
            return row;
        }
    }

    class DataMapper {
        constructor(documentMapper, strategies = []) {
            this.documentMapper = documentMapper;
            this.strategies = strategies;
        }
        toEntities(data, operation) {
            const result = [];
            data.some((row, index) => {
                const abort = () => (aborted = true);
                let entity = this.documentMapper.toEntity(row);
                let aborted = false;
                this.strategies.forEach((strategy) => {
                    entity = strategy.toEntities(entity, index, abort);
                });
                if (typeof operation === "function")
                    operation(entity, index, abort);
                if (!aborted)
                    result.push(entity);
                return aborted;
            });
            return result;
        }
        toData(entities) {
            return entities.map((entity, index) => {
                entity = this.strategies.reduce((en, strategy) => strategy.toData(en, index), Object.assign({}, entity));
                return this.documentMapper.toRow(entity);
            });
        }
    }

    class DataService {
        constructor(rangeService, dataMapper) {
            this.rangeService = rangeService;
            this.dataMapper = dataMapper;
        }
        get(operation) {
            const values = this.rangeService.getValues();
            return this.dataMapper.toEntities(values, operation);
        }
        set(index, value) { }
        append(entities) {
            if (entities.length < 1)
                return;
            const values = this.dataMapper.toData(entities);
            this.rangeService.appendValues(values);
        }
        sort(options) {
            this.rangeService.sort(options);
        }
        clear(...indexes) {
            if (indexes.length < 1)
                return;
            this.rangeService.clearRows(...indexes.map((index) => index + 1));
        }
    }

    var FindOperator;
    (function (FindOperator) {
        FindOperator["GTE"] = "$gte";
        FindOperator["LTE"] = "$lte";
        FindOperator["GT"] = "$gt";
        FindOperator["LT"] = "$lt";
        FindOperator["NE"] = "$ne";
        FindOperator["IN"] = "$in";
        FindOperator["NIN"] = "$nin";
    })(FindOperator || (FindOperator = {}));
    var FindObjectOperator;
    (function (FindObjectOperator) {
        FindObjectOperator["OR"] = "$or";
        FindObjectOperator["AND"] = "$and";
    })(FindObjectOperator || (FindObjectOperator = {}));

    class FindBuilder {
        constructor(_findObject) {
            this._findObject = _findObject;
            this._compareOperation = this._buildCompareOperation(_findObject);
        }
        compare(entities) {
            if (Array.isArray(entities)) {
                return entities.every((entity) => this.compare(entity));
            }
            else
                return this._compareOperation(entities);
        }
        _resolveCondition(value, conditions) {
            if (typeof conditions !== "object" || conditions === null) {
                return value === conditions;
            }
            else {
                for (const operation in conditions) {
                    if (!Object.values(FindOperator).includes(operation))
                        continue;
                    const conditionValue = conditions[operation];
                    switch (operation) {
                        case FindOperator.GTE:
                            if (!(value >= conditionValue))
                                return false;
                            break;
                        case FindOperator.LTE:
                            if (!(value <= conditionValue))
                                return false;
                            break;
                        case FindOperator.GT:
                            if (!(value > conditionValue))
                                return false;
                            break;
                        case FindOperator.LT:
                            if (!(value < conditionValue))
                                return false;
                            break;
                        case FindOperator.NE:
                            if (!(value !== conditionValue))
                                return false;
                            break;
                        case FindOperator.IN:
                            if (!(Array.isArray(conditionValue) && conditionValue.includes(value)))
                                return false;
                            break;
                        case FindOperator.NIN:
                            if (!(Array.isArray(conditionValue) && !conditionValue.includes(value)))
                                return false;
                            break;
                    }
                }
                return true;
            }
        }
        _buildCompareOperation(findObject) {
            let directConditions = [];
            let andOperations = [];
            let orOperations = null;
            for (const [key, conditions] of Object.entries(findObject)) {
                if (conditions !== undefined) {
                    if (key === FindObjectOperator.OR && Array.isArray(conditions)) {
                        orOperations = conditions.map((condition) => {
                            return this._buildCompareOperation(condition);
                        });
                    }
                    else if (key === FindObjectOperator.AND && Array.isArray(conditions)) {
                        andOperations = conditions.map((condition) => {
                            return this._buildCompareOperation(condition);
                        });
                    }
                    else {
                        if (!directConditions)
                            directConditions = [];
                        directConditions.push((entity) => this._resolveCondition(entity[key], conditions));
                    }
                }
            }
            return (entity) => {
                const directResult = directConditions.every((op) => op(entity));
                if (!directResult)
                    return false;
                const andResult = andOperations.every((op) => op(entity));
                if (!andResult)
                    return false;
                return orOperations !== null ? orOperations.some((op) => op(entity)) : true;
            };
        }
    }

    class Repository {
        constructor(dataService, map) {
            this.dataService = dataService;
            this.map = map;
        }
        find(findObject) {
            const finder = new Repository.FindBuilderConstructor(findObject);
            const result = [];
            this.dataService.get((entity) => {
                if (finder.compare(entity))
                    result.push(entity);
            });
            return result;
        }
        findOne(findObject) {
            const finder = new Repository.FindBuilderConstructor(findObject);
            let result = null;
            this.dataService.get((entity, index, abort) => {
                if (finder.compare(entity)) {
                    result = entity;
                    abort();
                }
            });
            return result;
        }
        findAndDelete(findObject) {
            const finder = new Repository.FindBuilderConstructor(findObject);
            let indexes = [];
            this.dataService.get((entity, index, abort) => {
                if (finder.compare(entity))
                    indexes.push(index);
            });
            this.dataService.clear(...indexes);
            return {
                deleted: Boolean(indexes.length),
                indexes: indexes,
                counter: indexes.length,
            };
        }
        insert(entity) {
            this.insertMany([entity]);
        }
        insertMany(entities) {
            if (entities.length < 1)
                return;
            this.dataService.append(entities);
        }
        sort(key, ascending) {
            const columnIndex = key && key in this.map ? this.map[key] + 1 : 1;
            this.dataService.sort({
                column: columnIndex,
                ascending: typeof ascending === "boolean" ? ascending : false,
            });
        }
        deleteOne(findObject) {
            const finder = new Repository.FindBuilderConstructor(findObject);
            let indexes = [];
            this.dataService.get((entity, index, abort) => {
                if (finder.compare(entity)) {
                    indexes.push(index);
                    abort();
                }
            });
            this.dataService.clear(...indexes);
            return {
                deleted: Boolean(indexes.length),
                indexes: indexes,
                counter: indexes.length,
            };
        }
    }
    Repository.FindBuilderConstructor = FindBuilder;

    class SheetManagerException extends Error {
        constructor(message) {
            super(message);
            this.name = "SheetManagerError";
            this.showModal();
        }
        showModal() {
            try {
                const template = HtmlService.createHtmlOutput(`
            <!DOCTYPE html>
            <html>
              <head>
                <base target="_top">
                <style>
                  body {
                    font-family: 'Segoe UI', sans-serif;
                    background-color: #fff3f3;
                    color: #a30000;
                    padding: 20px;
                  }
                  .error-box {
                    border: 1px solid #e0b4b4;
                    background-color: #ffe6e6;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                  }
                  h2 {
                    margin-top: 0;
                    color: #a30000;
                  }
                  pre {
                    background: #fff0f0;
                    border: 1px solid #f5c6cb;
                    padding: 10px;
                    overflow-x: auto;
                    font-size: 12px;
                    border-radius: 5px;
                    color: #5a0000;
                  }
                  .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #444;
                  }
                </style>
              </head>
              <body>
                <div class="error-box">
                  <h2>Произошла ошибка!</h2>
                  <strong>Имя:</strong> ${this.name}<br>
                  <strong>Сообщение:</strong> ${this.message}<br><br>
                  <strong>Стек вызова:</strong>
                  <pre>${this.stack}</pre>
                  <div class="footer">
                    Повторите попытку позже, если ошибка повторится — обратитесь к администратору.
                  </div>
                </div>
              </body>
            </html>
        `);
                const html = template.setWidth(600).setHeight(400);
                SpreadsheetApp.getUi().showModalDialog(html, "Произошла ошибка!");
            }
            catch (e) { }
        }
    }

    class SelectorRequired extends SheetManagerException {
        constructor(selector) {
            const message = `Selector is required`;
            super(message);
        }
    }

    class EntitySchemaColumn {
        constructor(column) {
            var _a, _b, _c, _d, _e;
            this.transform = { from: null, to: null };
            if (typeof column === "object") {
                if (column.selector === undefined)
                    throw new SelectorRequired();
                this.selector = column.selector;
                this.primary = (_a = column.primary) !== null && _a !== void 0 ? _a : false;
                this.transform.to = (_c = (_b = column.transform) === null || _b === void 0 ? void 0 : _b.to) !== null && _c !== void 0 ? _c : null;
                this.transform.from = (_e = (_d = column.transform) === null || _d === void 0 ? void 0 : _d.from) !== null && _e !== void 0 ? _e : null;
            }
            else {
                this.primary = false;
                this.selector = column;
            }
        }
    }

    class EntitySchema {
        constructor(options) {
            var _a, _b, _c, _d;
            this.transform = { from: null, to: null };
            this.selector = options.selector;
            this.transform.to = (_b = (_a = options.transform) === null || _a === void 0 ? void 0 : _a.to) !== null && _b !== void 0 ? _b : null;
            this.transform.from = (_d = (_c = options.transform) === null || _c === void 0 ? void 0 : _c.from) !== null && _d !== void 0 ? _d : null;
            this.ranges = options.ranges || { headers: null, data: null };
            const columns = {};
            for (const key in options.columns) {
                const column = options.columns[key];
                columns[key] = new EntitySchemaColumn(column);
            }
            this.columns = columns;
        }
    }

    class BadColumnSelector extends SheetManagerException {
        constructor(selector) {
            super(`Bad column selector, column ${selector} not found`);
        }
    }

    class MapBuilder {
        constructor(columns, headersRange) {
            this.columns = columns;
            if (headersRange) {
                this.headers = headersRange.getValues()[0].map((el) => String(el));
            }
            else
                this.headers = [];
        }
        getMap() {
            const headers = this.headers;
            const map = {};
            for (const key in this.columns) {
                const column = this.columns[key];
                const selector = column.selector;
                if (typeof selector === "number") {
                    map[key] = selector;
                }
                else {
                    const index = headers.indexOf(selector);
                    if (index === -1)
                        throw new BadColumnSelector(selector);
                    else
                        map[key] = index;
                }
            }
            return map;
        }
    }

    class BadSchemaOptions extends SheetManagerException {
        constructor(message) {
            super(`Bad schema options: ${message}`);
        }
    }

    class RequiredSchemaOption extends BadSchemaOptions {
        constructor(property) {
            super(`${property} is required!`);
        }
    }

    class OptionsSchemaDuplicate extends SheetManagerException {
        constructor(selector) {
            super(`Such a scheme${String(selector) || ""} already exists `);
        }
    }

    class Range {
        constructor(sheet, range) {
            this.sheet = sheet;
            this.range = range;
        }
        get row() {
            return this.range.getRow();
        }
        get column() {
            return this.range.getColumn();
        }
        get rows() {
            return this.range.getNumRows();
        }
        get columns() {
            return this.range.getNumColumns();
        }
        get lastRow() {
            return this.range.getLastRow();
        }
        get lastColumn() {
            return this.range.getLastColumn();
        }
        getValues() {
            return this.range.getValues();
        }
        setValues(values) {
            this.range.setValues(values);
            this.sheet.invalidateCache();
        }
        getA1Notation() {
            return this.range.getA1Notation();
        }
        clearContent() {
            this.range.clearContent();
            this.sheet.invalidateCache();
        }
        sort(options) {
            this.range.sort(options);
            this.sheet.invalidateCache();
        }
    }

    class TokenResultNotNumber extends SheetManagerException {
        constructor(token) {
            const message = `The expression(${token}) did not give a number.`;
            super(message);
        }
    }

    class BadRangeSignature extends SheetManagerException {
        constructor(signature) {
            super(`Invalid range signature: ${signature} for Sheet.getRange()`);
        }
    }

    var RangeTokens;
    (function (RangeTokens) {
        RangeTokens["MaxRows"] = "mr";
        RangeTokens["MaxColumns"] = "mc";
        RangeTokens["LastRow"] = "lr";
        RangeTokens["LastColumn"] = "lc";
    })(RangeTokens || (RangeTokens = {}));
    class RangeBuilder {
        constructor(sheet) {
            this.sheet = sheet;
            this._lastColumn = null;
            this._lastRow = null;
            this._rows = null;
            this._columns = null;
        }
        get lastColumn() {
            var _a;
            return (this._lastColumn = (_a = this._lastColumn) !== null && _a !== void 0 ? _a : this.sheet.getLastColumn());
        }
        get lastRow() {
            var _a;
            return (this._lastRow = (_a = this._lastRow) !== null && _a !== void 0 ? _a : this.sheet.getLastRow());
        }
        get rows() {
            var _a;
            return (this._rows = (_a = this._rows) !== null && _a !== void 0 ? _a : this.sheet.getMaxRows());
        }
        get columns() {
            var _a;
            return (this._columns = (_a = this._columns) !== null && _a !== void 0 ? _a : this.sheet.getMaxColumns());
        }
        static isToken(...tokens) {
            const isTokens = [...tokens].map((token) => {
                token = String(token);
                return Boolean(token.includes(RangeTokens.LastRow) ||
                    token.includes(RangeTokens.LastColumn) ||
                    token.includes(RangeTokens.MaxRows) ||
                    token.includes(RangeTokens.MaxColumns));
            });
            return isTokens.includes(true);
        }
        getRange(tokenRow, tokenColumn, tokenRows, tokenColumns) {
            if (typeof tokenRow === "string" && tokenRow.includes(",")) {
                let [row, column, rows, columns] = tokenRow.split(",");
                row = Number(row) || row;
                column = Number(column) || column;
                rows = Number(rows) || rows;
                columns = Number(columns) || columns;
                return this.getRange(row, column, rows, columns);
            }
            const tokens = [tokenRow, tokenColumn, tokenRows, tokenColumns];
            const rangeArguments = [0, 0, 0, 0];
            const signature = tokens
                .map((token) => (RangeBuilder.isToken(token) ? "token" : typeof token))
                .join(",");
            if (typeof tokenRow === "function") {
                return tokenRow(this.sheet);
            }
            else if (tokenRow && tokenColumn) {
                rangeArguments[0] = this._resolveToken(tokenRow);
                rangeArguments[1] = this._resolveToken(tokenColumn);
                rangeArguments[2] = this._resolveToken(tokenRows || 1);
                rangeArguments[3] = this._resolveToken(tokenColumns || 1);
            }
            else if (typeof tokenRow === "string" && isNaN(Number(tokenRow))) {
                return this.sheet.getRange(tokenRow);
            }
            else {
                throw new BadRangeSignature(signature);
            }
            if (rangeArguments.includes(0))
                throw new BadRangeSignature(signature);
            return this.sheet.getRange(...rangeArguments);
        }
        _resolveToken(token) {
            if (typeof token === "number")
                return token;
            const { LastRow, LastColumn, MaxRows, MaxColumns } = RangeTokens;
            const regLastRow = new RegExp(`\\b${LastRow}\\b`, "g"), regLastColumn = new RegExp(`\\b${LastColumn}\\b`, "g"), regMaxRows = new RegExp(`\\b${MaxRows}\\b`, "g"), regMaxColumns = new RegExp(`\\b${MaxColumns}\\b`, "g");
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
            if (typeof result !== "number" || isNaN(result))
                throw new TokenResultNotNumber(token);
            return result;
        }
    }

    class DataOutOfRange extends SheetManagerException {
        constructor(initColumns, numColumns) {
            super(`Data out of range, columns available ${initColumns} used ${numColumns}`);
        }
    }

    class InvalidRangeValues extends SheetManagerException {
        constructor() {
            super(`The array must store at least 1 drawing`);
        }
    }

    class UnevenValues extends SheetManagerException {
        constructor() {
            super(`Values rows of different sizes`);
        }
    }

    const DEFAULT_RANGE = `1, 1, ${RangeTokens.MaxRows}, ${RangeTokens.MaxColumns}`;
    class RangeService {
        constructor(sheet, initRange, defaultRange) {
            this.sheet = sheet;
            this._defaultRange = `1, 1, ${RangeTokens.MaxRows}, ${RangeTokens.MaxColumns}`;
            this._defaultRange = defaultRange || DEFAULT_RANGE;
            if (typeof initRange === "function" || typeof initRange === "string") {
                this._range = this.sheet.getRange(initRange);
            }
            else if (initRange instanceof Range) {
                this._range = initRange;
            }
            else {
                this._range = this.sheet.getRange(this._defaultRange);
            }
        }
        getValues() {
            return this._range.getValues();
        }
        appendValues(values) {
            if (values.length < 1)
                return;
            this.invalidateRange();
            const initColumn = this._range.column;
            const initColumns = this._range.columns;
            const numRows = values.length;
            const numColumns = values[0].length;
            if (numColumns > initColumns)
                throw new DataOutOfRange(initColumns, numColumns);
            else if (values.length < 1)
                throw new InvalidRangeValues();
            else if (values.some((row) => row.length !== values[0].length))
                throw new UnevenValues();
            else {
                this.sheet
                    .getRange(`${RangeTokens.LastRow} + 1`, initColumn, numRows, numColumns)
                    .setValues(values);
            }
        }
        sort(options) {
            this.invalidateRange();
            const columnOffset = this._range.column - 1;
            let column;
            let ascending;
            if (typeof options === "object") {
                column = options.column ? options.column + columnOffset : this._range.column;
                ascending = options.ascending || false;
            }
            else {
                column = options ? options + columnOffset : this._range.column;
                ascending = false;
            }
            this._range.sort({ column, ascending });
        }
        clearRows(...rows) {
            this.invalidateRange();
            const initColumn = this._range.column;
            const initColumns = this._range.columns;
            const rangeList = [];
            const offset = this._range.row - 1;
            for (const rowNum of rows) {
                const rowRange = this.sheet.getRange(rowNum + offset, initColumn, 1, initColumns);
                rangeList.push(rowRange.getA1Notation());
            }
            this.sheet.getRangeList(rangeList).clearContent();
        }
        invalidateRange() {
            const initRow = this._range.row;
            const initColumn = this._range.column;
            const initColumns = this._range.columns;
            const offset = initRow - 1;
            const rowsToken = `${RangeTokens.MaxRows} - ${offset}`;
            this._range = this.sheet.getRange(initRow, initColumn, rowsToken, initColumns);
        }
    }

    class EntityNotFound extends SheetManagerException {
        constructor(selector) {
            super(`Entity ${String(selector)} not found`);
        }
    }

    class DocumentStrategy {
        toEntity(value, key) {
            return value;
        }
        toRow(value, key) {
            return value;
        }
    }

    class DataStrategy extends DocumentStrategy {
        toData(entity) {
            return entity;
        }
        toEntities(entity, index, abort) {
            return entity;
        }
    }

    class TransformStrategy extends DataStrategy {
        constructor(schema) {
            super();
            this.schema = schema;
        }
        toEntities(entity, index, abort) {
            var _a;
            const transform = (_a = this.schema.transform) === null || _a === void 0 ? void 0 : _a.from;
            if (typeof transform === "function") {
                return transform(entity);
            }
            else
                return entity;
        }
        toData(entity) {
            var _a;
            const transform = (_a = this.schema.transform) === null || _a === void 0 ? void 0 : _a.to;
            if (typeof transform === "function") {
                return transform(entity);
            }
            else
                return entity;
        }
        toEntity(value, key) {
            var _a, _b;
            const transform = (_b = (_a = this.schema.columns[key]) === null || _a === void 0 ? void 0 : _a.transform) === null || _b === void 0 ? void 0 : _b.from;
            if (typeof transform === "function") {
                return transform(value);
            }
            else
                return value;
        }
        toRow(value, key) {
            var _a, _b;
            const transform = (_b = (_a = this.schema.columns[key]) === null || _a === void 0 ? void 0 : _a.transform) === null || _b === void 0 ? void 0 : _b.to;
            if (typeof transform === "function") {
                return transform(value);
            }
            else
                return value;
        }
    }

    class RangeList {
        constructor(sheet, rangeList) {
            this.sheet = sheet;
            this.rangeList = rangeList;
        }
        clearContent() {
            this.rangeList.clearContent();
            this.sheet.invalidateCache();
        }
        getRanges() {
            return this.rangeList
                .getRanges()
                .map((range) => new RangeList.RangeConstructor(this.sheet, range));
        }
    }
    RangeList.RangeConstructor = Range;

    class Sheet {
        constructor(sheet) {
            this.sheet = sheet;
            this.row = 1;
            this.column = 1;
            this._lastColumn = null;
            this._lastRow = null;
            this._rows = null;
            this._columns = null;
        }
        get lastColumn() {
            var _a;
            return (this._lastColumn = (_a = this._lastColumn) !== null && _a !== void 0 ? _a : this.sheet.getLastColumn());
        }
        get lastRow() {
            var _a;
            return (this._lastRow = (_a = this._lastRow) !== null && _a !== void 0 ? _a : this.sheet.getLastRow());
        }
        get rows() {
            var _a;
            return (this._rows = (_a = this._rows) !== null && _a !== void 0 ? _a : this.sheet.getMaxRows());
        }
        get columns() {
            var _a;
            return (this._columns = (_a = this._columns) !== null && _a !== void 0 ? _a : this.sheet.getMaxColumns());
        }
        getName() {
            return this.sheet.getName();
        }
        getRangeList(a1Notations) {
            const rangeList = this.sheet.getRangeList(a1Notations);
            return new RangeList(this, rangeList);
        }
        getValues() {
            return this.getRange(this.row, this.column, RangeTokens.MaxRows, RangeTokens.MaxColumns).getValues();
        }
        invalidateCache() {
            this._columns = null;
            this._rows = null;
            this._lastRow = null;
            this._lastColumn = null;
        }
        getRange(a1Notation, column, rows, columns) {
            const rangeBuilder = new Sheet.RangeBuilderConstructor(this.sheet);
            const range = rangeBuilder.getRange(a1Notation, column, rows, columns);
            return new Sheet.RangeConstructor(this, range);
        }
        getDataRange() {
            return new Sheet.RangeConstructor(this, this.sheet.getDataRange());
        }
    }
    Sheet.RangeConstructor = Range;
    Sheet.RangeBuilderConstructor = RangeBuilder;

    class IncorrectTableId extends SheetManagerException {
        constructor(id) {
            const message = `Table by id(${String(id)}) not found`;
            super(message);
        }
    }

    class IncorrectSelectorSheet extends SheetManagerException {
        constructor(selector) {
            const message = `Sheet by selector(${String(selector)} not found`;
            super(message);
        }
    }

    class Table {
        constructor(id) {
            try {
                if (id)
                    this.spreadsheet = SpreadsheetApp.openById(id);
                else
                    this.spreadsheet = SpreadsheetApp.getActive();
                this.id = id ? id : this.spreadsheet.getId();
            }
            catch (e) {
                throw new IncorrectTableId(id);
            }
        }
        getSheet(selector) {
            const spreadsheet = this.spreadsheet;
            let sheet = null;
            if (typeof selector === "string") {
                sheet = spreadsheet.getSheetByName(selector);
            }
            else {
                sheet = spreadsheet.getSheets()[selector];
            }
            if (sheet)
                return new Sheet(sheet);
            else
                throw new IncorrectSelectorSheet(selector);
        }
    }

    const DEFAULT_DATA_RANGE = {
        row: 1,
        column: 1,
        columns: `${RangeTokens.MaxColumns}`,
    };
    class DataSource {
        constructor(options = {}) {
            var _a;
            this.entities = new Map();
            this.repositories = new Map();
            this.table = null;
            this.id = options.id || null;
            (_a = options.entities) === null || _a === void 0 ? void 0 : _a.forEach((entity) => {
                if (typeof entity.selector !== undefined && entity.selector !== null) {
                    if (!this.entities.has(entity.selector)) {
                        const schema = new EntitySchema(entity);
                        this.entities.set(entity.selector, schema);
                    }
                    else
                        throw new OptionsSchemaDuplicate(entity.selector);
                }
                else
                    throw new RequiredSchemaOption("EntitySchema.selector");
            });
        }
        getRepository(selector) {
            const table = this._getSource();
            let repository = this.repositories.get(selector);
            if (repository === undefined) {
                const entity = this.entities.get(selector);
                if (entity) {
                    const sheet = table.getSheet(selector);
                    const strategies = [new TransformStrategy(entity)];
                    repository = createRepository(sheet, entity.ranges, entity.columns, strategies);
                    this.repositories.set(selector, repository);
                    return repository;
                }
                else
                    throw new EntityNotFound(selector);
            }
            return repository;
        }
        _getSource() {
            if (!this.table)
                this.table = new Table(this.id || undefined);
            return this.table;
        }
    }
    function initRange(sheet, range, defaultRange) {
        if (typeof range === "function" || typeof range === "string") {
            return sheet.getRange(range);
        }
        else if (defaultRange) {
            return sheet.getRange(defaultRange);
        }
        else {
            return null;
        }
    }
    function createRanges(sheet, ranges) {
        ranges = Object.assign({}, ranges);
        const headersRange = initRange(sheet, ranges.headers);
        const row = headersRange ? headersRange.row + 1 : DEFAULT_DATA_RANGE.row;
        const column = headersRange ? headersRange.column : DEFAULT_DATA_RANGE.column;
        const rows = `${RangeTokens.MaxRows} - ${row - 1}`;
        const columns = headersRange ? headersRange.columns : DEFAULT_DATA_RANGE.columns;
        const dataRange = initRange(sheet, ranges.data, `${row}, ${column}, ${rows}, ${columns}`);
        return {
            headers: headersRange,
            data: dataRange,
        };
    }
    function createRepository(sheet, ranges, columns, strategies) {
        const { headers, data } = createRanges(sheet, ranges);
        const rangeService = new RangeService(sheet, data);
        const map = new MapBuilder(columns, headers).getMap();
        const documentMapper = new DocumentMapper(map, strategies);
        const dataMapper = new DataMapper(documentMapper, strategies);
        const dataService = new DataService(rangeService, dataMapper);
        return new Repository(dataService, map);
    }

    function dataSource(options) {
        return new DataSource(options);
    }

    exports.dataSource = dataSource;

    return exports;

})({});
