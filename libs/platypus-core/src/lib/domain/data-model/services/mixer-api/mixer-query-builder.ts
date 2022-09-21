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
    const isTimeSeries = field.type.name === 'TimeSeries';

    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);

    if (isPrimitive && !isTimeSeries) {
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
