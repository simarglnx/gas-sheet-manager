import { IDocumentStrategy } from "@core/data-mapper/types/DocumentMapper";

export class DocumentStrategy implements IDocumentStrategy {
    toEntity(value: any, key: string): any {
        return value;
    }

    toRow(value: any, key: string): any {
        return value;
    }
}
