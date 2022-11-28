import { mixerApiBuiltInTypes } from '../constants';
import { isInlineType } from '../utils';

import { DataModelTypeDefsField, DataModelTypeDefsType } from '../types';
import { BuildQueryDTO } from '../dto';

export class MixerQueryBuilder {
  getOperationName(typeName: string): string {
    return `list${typeName}`;
  }
  getFilterType(typeName: string): string {
    return `_List${typeName}Filter`;
  }
  buildQuery(dto: BuildQueryDTO): string {
    const {
      dataModelType,
      dataModelTypeDefs,
      limit,
      cursor,
      hasNextPage,
      filter,
    } = dto;
    const pagination = hasNextPage
      ? `first: ${limit}, after: "${cursor}"`
      : `first: ${limit}`;
    const filterString = filter
      ? `(filter: $filter, ${pagination})`
      : `(${pagination})`;
    return `query ${
      filter
        ? `${this.getOperationName(
            dataModelType.name
          )} ($filter: ${this.getFilterType(dataModelType.name)})`
        : ''
    } {
    ${this.getOperationName(dataModelType.name)}${filterString} {
      items {
        externalId
        ${dataModelType.fields
          .map((field) =>
            this.buildQueryItem(
              field,
              dataModelTypeDefs.types.find(
                (typeDef) => typeDef.name === field.type.name
              )
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
    fieldTypeDef?: DataModelTypeDefsType
  ): string {
    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);

    if (isPrimitive) {
      if (field.type.name === 'TimeSeries') {
        return `${field.name} { externalId }`;
      }
      return field.name;
    }

    if (fieldTypeDef && isInlineType(fieldTypeDef)) {
      return `${field.name} { ${fieldTypeDef.fields
        .map((typeDefField) => typeDefField.name)
        .join('\n')} }`;
    }

    if (field.type.list) {
      return `${field.name} { items { externalId } }`;
    }

    return `${field.name} { externalId }`;
  }
}
