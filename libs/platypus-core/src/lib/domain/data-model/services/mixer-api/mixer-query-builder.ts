import { mixerApiBuiltInTypes } from '../../constants';

import { isInlineType } from '../utils';
import { BuildQueryDTO } from '../../dto';
import { DataModelTypeDefsField, DataModelTypeDefsType } from '../../types';

export class MixerQueryBuilder {
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
            this.buildQueryItem(
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

  private buildQueryItem(
    field: DataModelTypeDefsField,
    fieldTypeDef: DataModelTypeDefsType
  ): string {
    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);
    let queryItem = `${field.name}`;

    if (!isPrimitive) {
      if (isInlineType(fieldTypeDef)) {
        queryItem = `${queryItem} { ${fieldTypeDef.fields
          .map((typeDefField) => typeDefField.name)
          .join('\n')} }`;
      } else {
        if (field.type.list) {
          queryItem = `${queryItem} { items { externalId } }`;
        } else {
          queryItem = `${queryItem} { externalId }`;
        }
      }
    }

    return queryItem;
  }
}
