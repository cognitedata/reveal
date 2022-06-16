import { mixerApiBuiltInTypes } from '../constants';
import { BuildQueryDTO } from '../dto';
import { DataModelTypeDefsField } from '../types';

export class MixerApiQueryBuilderService {
  getOperationName(typeName: string): string {
    return `list${typeName}`;
  }
  buildQuery(dto: BuildQueryDTO): string {
    const { dataModelType, limit, cursor, hasNextPage } = dto;
    const pagination = hasNextPage
      ? `(first: ${limit}, after: "${cursor}")`
      : `(first: ${limit})`;
    return `query {
    ${this.getOperationName(dataModelType.name)}${pagination} {
      items {
        externalId
        ${dataModelType.fields
          .map((field) => this.buildQryItem(field))
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

  private buildQryItem(field: DataModelTypeDefsField): string {
    const isPrimitive = mixerApiBuiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);
    let qryItem = `${field.name}`;

    if (!isPrimitive) {
      qryItem = `${qryItem} { externalId }`;
    }
    return qryItem;
  }
}
