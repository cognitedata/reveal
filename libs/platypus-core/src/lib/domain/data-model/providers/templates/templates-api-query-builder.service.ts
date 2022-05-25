import { IQueryBuilderService } from '../../boundaries';
import { templatesBiltInTypes } from '../../constants';
import { BuildQueryDTO } from '../../dto';
import { DataModelTypeDefsField } from '../../types';

export class TemplatesApiQueryBuilderService implements IQueryBuilderService {
  getOperationName(typeName: string): string {
    return typeName[0].toLowerCase() + typeName.slice(1) + 'Query';
  }
  buildQuery(dto: BuildQueryDTO): string {
    const { dataModelType, limit, cursor, hasNextPage } = dto;
    const isBuiltInType =
      // eslint-disable-next-line
      templatesBiltInTypes
        .filter((type) => type.type === 'OBJECT')
        .findIndex((type) => type.name === dataModelType.name) !== -1;
    const pagination = hasNextPage
      ? `(limit: ${limit}, cursor: "${cursor}")`
      : `(limit: ${limit})`;
    return `query {
    ${this.getOperationName(dataModelType.name)}${pagination} {
      items {
        ${isBuiltInType ? 'externalId' : '_externalId'}
        ${dataModelType.fields
          .map((field) => this.buildQryItem(field))
          .join('\n')}
      }
      nextCursor
    }
  }`;
  }

  private buildQryItem(field: DataModelTypeDefsField): string {
    const isPrimitive = templatesBiltInTypes
      .filter((t) => t.type === 'SCALAR')
      .map((t) => t.name)
      .includes(field.type.name);
    let qryItem = field.name;

    const isBuiltInType =
      // eslint-disable-next-line
      templatesBiltInTypes
        .filter((type) => type.type === 'OBJECT')
        .findIndex((type) => type.name === field.type.name) !== -1;

    if (!isPrimitive) {
      const externalIdField = isBuiltInType ? 'externalId' : '_externalId';
      qryItem = `${qryItem}{ ${externalIdField} }`;
    }
    return qryItem;
  }
}
