import { mixerApiBuiltInTypes } from '../constants';
import { isInlineType } from '../utils';

import { DataModelTypeDefsField, DataModelTypeDefsType } from '../types';
import { BuildListQueryDTO, BuildSearchQueryDTO } from '../dto';

export enum OPERATION_TYPE {
  LIST = 'list',
  SEARCH = 'search',
}

export class MixerQueryBuilder {
  getOperationName(typeName: string, operationType: OPERATION_TYPE): string {
    return `${operationType}${typeName}`;
  }

  getFilterType(typeName: string): string {
    return `_List${typeName}Filter`;
  }

  buildListQuery(dto: BuildListQueryDTO): string {
    const {
      dataModelType,
      dataModelTypeDefs,
      limit,
      cursor,
      hasNextPage,
      filter,
      sort,
    } = dto;
    const pagination = hasNextPage
      ? `first: ${limit}, after: "${cursor}"`
      : `first: ${limit}`;
    const sortString = sort
      ? `, sort: {${sort.fieldName}: ${sort.sortType}}`
      : ``;
    const filterString = filter
      ? `(filter: $filter, ${pagination} ${sortString})`
      : `(${pagination} ${sortString})`;
    return `query ${
      filter
        ? `${this.getOperationName(
            dataModelType.name,
            OPERATION_TYPE.LIST
          )} ($filter: ${this.getFilterType(dataModelType.name)})`
        : ''
    } {
    ${this.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.LIST
    )}${filterString} {
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

  buildSearchQuery({
    dataModelType,
    dataModelTypeDefs,
  }: BuildSearchQueryDTO): string {
    const operationName = this.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.SEARCH
    );

    return `query ${operationName}($first: Int, $query: String!) {
    ${operationName}(first: $first, query: $query) {
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
