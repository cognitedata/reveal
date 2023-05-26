import {
  DataModelVersion,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelTypeDefsField,
} from '../../../../types';
import {
  isInlineType,
  getOneToManyModelName,
  getVersionedExternalId,
  getTypesMap,
  isCustomType,
} from '../../../../utils';
import {
  DataModelStorageModel,
  DataModelStorageModelsDTO,
  DmsModelProperty,
} from '../../dto';

export class DmsModelBuilder {
  /**
   * Builds bindings configuration that connects
   * Data Model with DataModelStorage
   * @param dataModel
   * @param dataModelVersion
   * @param dataModelTypeDefs
   * @returns
   */

  private typesMap;

  constructor() {
    this.typesMap = getTypesMap();
  }

  build(
    externalId: string,
    dataModelVersion: DataModelVersion,
    dataModelTypeDefs: DataModelTypeDefs
  ): DataModelStorageModelsDTO {
    // set propert type here
    const generatedStorageTypes = {
      spaceExternalId: externalId,
      items: [],
    } as DataModelStorageModelsDTO;

    const relationStorageTypes: Array<DataModelStorageModel> = [];

    dataModelTypeDefs.types
      // don't generate DMS storage for inline types
      .filter((type) => !isInlineType(type))
      .forEach((type) => {
        const typeName = type.name; // DataModelType name
        const table = {
          externalId: getVersionedExternalId(
            typeName,
            dataModelVersion.version
          ),
          properties: {},
        } as DataModelStorageModel;

        type.fields.forEach((field) => {
          if (isCustomType(field.type.name as string) && field.type.list) {
            relationStorageTypes.push(
              this.buildEdgeModel(type, field, dataModelVersion.version)
            );
          } else {
            table.properties[field.name] = this.buildModelProperty(field);
          }
        });

        generatedStorageTypes.items.push(table);
      });

    generatedStorageTypes.items.push(...relationStorageTypes);
    return generatedStorageTypes;
  }

  private buildEdgeModel(
    type: DataModelTypeDefsType,
    field: DataModelTypeDefsField,
    version: string
  ) {
    return {
      externalId: getOneToManyModelName(type.name, field.name, version), //from_type to_type property version
      allowNode: false,
      allowEdge: true,
      properties: {
        dummy: {
          type: 'text',
          nullable: true,
        },
      },
    };
  }

  private buildModelProperty(field: DataModelTypeDefsField) {
    const propType = field.type.name as string;

    const property = {
      type: isCustomType(propType)
        ? 'direct_relation'
        : field.type.list
        ? this.typesMap[propType] + '[]'
        : this.typesMap[propType],
      nullable: !field.type.nonNull,
    } as DmsModelProperty;

    if (isCustomType(propType)) {
      property.targetModel = [`node`];
    }

    return property;
  }
}
