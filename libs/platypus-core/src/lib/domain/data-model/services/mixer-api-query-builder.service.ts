import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from '../constants';
import { BuildQueryDTO } from '../dto';
import { DataModelTypeDefsField, DataModelTypeDefsType } from '../types';

export class MixerApiQueryBuilderService {
  getOperationName(typeName: string): string {
    return `list${typeName}`;
  }
  buildQuery(dto: BuildQueryDTO): string {
    const { dataModelType, dataModelTypeDefs, limit, cursor, hasNextPage } =
      dto;
    const pagination = hasNextPage
      ? `(first: ${limit}, after: "${cursor}")`
      : `(first: ${limit})`;
    return `query {
    ${this.getOperationName(dataModelType.name)}${pagination} {
      items {
        externalId
        ${dataModelType.fields
          .map((field) =>
            this.buildQryItem(
              field,
              dataModelTypeDefs.types.find(
                (typeDef) => typeDef.name === field.type.name
              )!
            )
          )
          .join('\n')}
      }
      pageInfo {
        startCursor
        hasPreviousPage
        hasNextPage
        endCursor
      }
    }
  }`;
  }

  private buildQryItem(
    field: DataModelTypeDefsField,
    fieldTypeDef: DataModelTypeDefsType
  ): string {
    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);
    let qryItem = `${field.name}`;

    if (!isPrimitive) {
      qryItem = this.isInlineType(fieldTypeDef)
        ? `${qryItem} { ${fieldTypeDef.fields
            .map((typeDefField) => typeDefField.name)
            .join('\n')} }`
        : `${qryItem} { externalId }`;
    }
    return qryItem;
  }

  private isInlineType(typeDef: DataModelTypeDefsType): boolean {
    return (
      typeDef.directives !== undefined &&
      typeDef.directives.length > 0 &&
      typeDef.directives.some(
        (directive) => directive.name === mixerApiInlineTypeDirectiveName
      )
    );
  }
}
