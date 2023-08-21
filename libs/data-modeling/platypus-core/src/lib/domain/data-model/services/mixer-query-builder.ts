import { mixerApiBuiltInTypes } from '../constants';
import {
  BuildGetByExternalIdQueryDTO,
  BuildListQueryDTO,
  BuildSearchQueryDTO,
  QuerySort,
} from '../dto';
import { DataModelTypeDefsField, DataModelTypeDefsType } from '../types';
import { isInlineType } from '../utils';

export enum OPERATION_TYPE {
  LIST = 'list',
  SEARCH = 'search',
  GET = 'get',
}

export class MixerQueryBuilder {
  getOperationName(typeName: string, operationType: OPERATION_TYPE): string {
    switch (operationType) {
      case OPERATION_TYPE.GET:
        return `${operationType}${typeName}ById`;
      default:
        return `${operationType}${typeName}`;
    }
  }

  getFilterType(typeName: string, operationType: OPERATION_TYPE): string {
    switch (operationType) {
      case OPERATION_TYPE.SEARCH:
        return `_Search${typeName}Filter`;
      default:
        return `_List${typeName}Filter`;
    }
  }

  buildListQuery(dto: BuildListQueryDTO, isFDMv2 = false): string {
    const {
      dataModelType,
      dataModelTypeDefs,
      limit,
      cursor,
      sort,
      nestedLimit,
      limitFields,
    } = dto;
    const queryName = this.buildQueryString(
      dataModelType.name,
      OPERATION_TYPE.LIST,
      { filter: this.getFilterType(dataModelType.name, OPERATION_TYPE.LIST) }
    );
    const paramString = this.buildFilterAndPaginationParamString(
      { limit, cursor: cursor },
      'filter',
      sort
    );
    return `query ${queryName} {
    ${this.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.LIST
    )}${paramString} {
      items {
        externalId
        ${
          isFDMv2
            ? 'spaceExternalId'
            : `
        space 
        lastUpdatedTime
        createdTime`
        }
        __typename
        ${dataModelType.fields
          .filter((el) => (limitFields ? limitFields.includes(el.name) : true))
          .map((field) =>
            this.buildQueryItem(
              field,
              dataModelTypeDefs.types.find(
                (typeDef) => typeDef.name === field.type.name
              ),
              { limit: nestedLimit },
              undefined,
              isFDMv2
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

  buildGetByExternalIdQuery(
    dto: BuildGetByExternalIdQueryDTO,
    isFDMv2 = false
  ): string {
    const {
      spaceId,
      externalId,
      dataModelType,
      dataModelTypeDefs,
      nestedCursors = {},
      nestedFilters = {},
      nestedLimit,
      limitFields,
    } = dto;
    const queryName = this.buildQueryString(
      dataModelType.name,
      OPERATION_TYPE.GET,
      dataModelType.fields
        .filter(
          (el) => nestedFilters[el.name] && el.type.custom && el.type.list
        )
        .reduce(
          (prev, curr) => ({
            ...prev,
            [curr.name]: this.getFilterType(
              curr.type.name,
              OPERATION_TYPE.LIST
            ),
          }),
          {} as {
            [key in string]: string;
          }
        )
    );
    return `query ${queryName} {
    ${this.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.GET
    )} (instance: { ${
      isFDMv2 ? 'spaceExternalId' : 'space'
    }: "${spaceId}", externalId: "${externalId}" }) {
      items {
        externalId
        ${
          isFDMv2
            ? 'spaceExternalId'
            : `
        space 
        lastUpdatedTime
        createdTime`
        }
        __typename
        ${dataModelType.fields
          .filter((el) => (limitFields ? limitFields.includes(el.name) : true))
          .map((field) =>
            this.buildQueryItem(
              field,
              dataModelTypeDefs.types.find(
                (typeDef) => typeDef.name === field.type.name
              ),
              {
                limit: nestedLimit,
                cursor: nestedCursors[field.name],
                pageInfo: true,
              },
              nestedFilters[field.name] ? field.name : undefined,
              isFDMv2
            )
          )
          .join('\n')}
      }
    }
  }`;
  }

  buildSearchQuery(
    { dataModelType, dataModelTypeDefs, limitFields }: BuildSearchQueryDTO,
    isFDMv2 = false
  ): string {
    const operationName = this.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.SEARCH
    );
    const queryName = this.buildQueryString(
      dataModelType.name,
      OPERATION_TYPE.SEARCH,
      {
        first: 'Int',
        query: 'String!',
        filter: this.getFilterType(dataModelType.name, OPERATION_TYPE.SEARCH),
      }
    );

    return `query ${queryName} {
    ${operationName}(first: $first, query: $query, filter: $filter) {
      items {
        externalId
        ${
          isFDMv2
            ? 'spaceExternalId'
            : `
        space 
        lastUpdatedTime
        createdTime`
        }
        __typename
        ${dataModelType.fields
          .filter((el) => (limitFields ? limitFields.includes(el.name) : true))
          .map((field) =>
            this.buildQueryItem(
              field,
              dataModelTypeDefs.types.find(
                (typeDef) => typeDef.name === field.type.name
              ),
              undefined,
              undefined,
              isFDMv2
            )
          )
          .join('\n')}
      }
    }
  }`;
  }

  private buildQueryItem(
    field: DataModelTypeDefsField,
    fieldTypeDef?: DataModelTypeDefsType,
    pagination: { limit: number; cursor?: string; pageInfo?: boolean } = {
      limit: 2,
      cursor: '',
      pageInfo: false,
    },
    filterName?: string,
    isFDMv2 = false
  ): string {
    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);

    if (isPrimitive) {
      if (
        field.type.name === 'TimeSeries' ||
        field.type.name === 'File' ||
        field.type.name === 'Sequence'
      ) {
        return `${field.name} { id externalId }`;
      }
      return field.name;
    }

    if (fieldTypeDef && isInlineType(fieldTypeDef)) {
      return `${field.name} { ${fieldTypeDef.fields
        .map((typeDefField) => typeDefField.name)
        .join('\n')} }`;
    }

    if (field.type.list) {
      const paramString = this.buildFilterAndPaginationParamString(
        pagination,
        filterName,
        undefined
      );
      return `${field.name} ${paramString} { items { externalId
        ${
          isFDMv2
            ? 'spaceExternalId'
            : `space
        lastUpdatedTime
        createdTime
        __typename`
        } } ${
        pagination.pageInfo
          ? `
      pageInfo {
        startCursor
        hasPreviousPage
        hasNextPage
        endCursor
      }`
          : ''
      }}`;
    }

    return `
      ${field.name} {
        externalId
        ${
          isFDMv2
            ? 'spaceExternalId'
            : `space
        lastUpdatedTime
        createdTime
        __typename`
        }
      }
    `;
  }

  /**
   * builds the parameter string
   * @param filter the filter parameter name (i.e. 'filter1'), you dont need the $
   * @param sort the sort conditions
   * @param pagination the pagination (limit and cursor)
   */
  private buildFilterAndPaginationParamString(
    pagination: { limit: number; cursor?: string },
    filterName?: string,
    sort?: QuerySort
  ) {
    const paginationString = pagination.cursor
      ? `first: ${pagination.limit}, after: "${pagination.cursor}"`
      : `first: ${pagination.limit}`;
    const sortString = sort
      ? `, sort: {${sort.fieldName}: ${sort.sortType}}`
      : ``;
    const filterString = filterName
      ? `(filter: $${filterName}, ${paginationString} ${sortString})`
      : `(${paginationString} ${sortString})`;

    return filterString;
  }

  /**
   * builds the query operation string
   * @param dataModelTypeName
   * @param operationType
   * @param filterNamesAndType the filterName and mapped type name i.e. { 'actors': this.getFilterType('Actor') }
   */
  private buildQueryString(
    dataModelTypeName: string,
    operationType: OPERATION_TYPE,
    filterNamesAndType: { [key in string]: string } = {}
  ) {
    return `${this.getOperationName(dataModelTypeName, operationType)} ${
      Object.keys(filterNamesAndType).length > 0
        ? `(${Object.entries(filterNamesAndType)
            .map(([name, type]) => `$${name}: ${type}`)
            .join(' ,')})`
        : ''
    }`;
  }
}
