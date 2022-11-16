import { mixerApiBuiltInTypes } from '../../../../constants';

import { isInlineType } from '../../../../utils';
import { BuildQueryDTO } from '../../dto';
import {
  DataModelTypeDefsField,
  DataModelTypeDefsType,
} from '../../../../types';

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
              ),
              dto.relationshipFieldsLimit
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
    fieldTypeDef?: DataModelTypeDefsType,
    relationshipFieldsLimit?: number
  ): string {
    const isTimeSeries = field.type.name === 'TimeSeries';

    if (this.isPrimitive(field) && !isTimeSeries) {
      return field.name;
    }

    if (fieldTypeDef && isInlineType(fieldTypeDef)) {
      return `${field.name} { ${fieldTypeDef.fields
        .map((typeDefField) => typeDefField.name)
        .join('\n')} }`;
    }

    const relationshipFields =
      fieldTypeDef === undefined
        ? []
        : fieldTypeDef.fields
            .filter(this.isPrimitive)
            .map((f) => f.name)
            .slice(0, relationshipFieldsLimit || 0);
    const relationshipQueryFields = ['externalId']
      .concat(relationshipFields)
      .join(' ');

    if (field.type.list) {
      return `${field.name} { items { ${relationshipQueryFields} } }`;
    }

    return `${field.name} { ${relationshipQueryFields} }`;
  }

  private isPrimitive(field: DataModelTypeDefsField): boolean {
    return mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);
  }
}
