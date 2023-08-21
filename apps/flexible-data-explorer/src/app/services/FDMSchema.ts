import { GraphQlUtilsService } from '@platypus/platypus-common-utils';

import { BASE_FIELDS } from './constants';
import { DataModelByIdResponse, DataModelTypeDefs, DataModelV2 } from './types';

const extractDescriptionTokens = (description?: string) => {
  const tokens = description?.split('\n');

  if (!tokens) {
    return undefined;
  }

  return tokens.reduce(
    (acc, item) => {
      if (item.startsWith('@name')) {
        return {
          ...acc,
          displayName: item.replace('@name', '').trim(),
        };
      }

      return {
        ...acc,
        description:
          acc.description === '' ? item : `${acc.description}. ${item}`,
      };
    },
    {
      description: '',
      displayName: '',
    }
  );
};

export class FDMSchema {
  public name: string;
  public externalId: string;
  private description: string;
  private version: string;
  private space: string;
  private schema: DataModelTypeDefs;

  constructor(dataModel: DataModelByIdResponse) {
    this.name = dataModel.name;
    this.externalId = dataModel.externalId;
    this.space = dataModel.space;
    this.version = dataModel.version;
    this.description = dataModel.description;

    this.schema = this.parseSchema(dataModel.graphQlDml);
  }

  public get types() {
    const types = this.schema?.types || [];

    return types
      ?.filter((type) => {
        // Remove system data model imports from the type list.
        return !type.directives?.some((item) => item.name === 'import');
      })
      .map((type) => {
        const descriptionTokens = extractDescriptionTokens(type.description);

        return {
          ...type,
          ...descriptionTokens,
          fields: type.fields?.map((field) => {
            const fieldDescriptionTokens = extractDescriptionTokens(
              field.description
            );

            return {
              ...field,
              ...fieldDescriptionTokens,
              isThreeD:
                field.name === 'inModel3d' && field.type.name === 'Cdf3dModel',
            };
          }),
        };
      });
  }

  public get directives() {
    return this.schema?.directives;
  }

  public get dataModel(): DataModelV2 {
    return {
      externalId: this.externalId,
      space: this.space,
      version: this.version,
    };
  }

  public getType(dataType: string) {
    const type = this.types?.find((item) => item.name === dataType);

    if (!type) {
      return undefined;
    }

    return type;
  }

  private parseSchema(graphQlDml?: string) {
    if (!graphQlDml) {
      throw new Error('NO SCHEMA FOUND');
    }

    return new GraphQlUtilsService().parseSchema(graphQlDml);
  }

  private isPrimitive(type: string) {
    return [
      'String',
      'Int',
      'Int64',
      'Float',
      'Float32',
      'Float64',
      'JSONObject',
      'Date',
      'Boolean',
      'Timestamp',
    ].includes(type);
  }

  public getPrimitiveFields(dataType: string) {
    if (
      dataType === 'TimeSeries' ||
      dataType === 'File' ||
      dataType === 'Sequence'
    ) {
      return ['externalId'];
    }

    const types = this.getType(dataType)?.fields.filter((field) => {
      return this.isPrimitive(field.type.name);
    });

    const normalizedTypes = (types || []).map((type) => {
      return type.name;
    });

    return [...normalizedTypes, ...BASE_FIELDS];
  }

  public getDirectRelationships(dataType: string) {
    return this.getType(dataType)?.fields.filter((field) => {
      return !this.isPrimitive(field.type.name) && !field.type.list;
    });
  }

  public listEdgeRelationships(dataType: string) {
    return this.getType(dataType)?.fields.filter((field) => {
      return !this.isPrimitive(field.type.name) && field.type.list;
    });
  }
}
