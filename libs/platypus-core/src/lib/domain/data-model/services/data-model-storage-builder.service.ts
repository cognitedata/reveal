import { DataModelStorageBindingsDTO, DataModelStorageModelsDTO } from '../dto';

import {
  DataModelVersion,
  DataModelTypeDefs,
  DataModelStorageModel,
  DmsModelProperty,
  DataModelTypeDefsType,
} from '../types';
import { KeyValueMap } from '../../../boundaries/types';
import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from '../constants';

export class DataModelStorageBuilderService {
  /**
   * Builds bindings configuration that connects
   * Data Model with DataModelStorage
   * @param dataModel
   * @param dataModelVersion
   * @param dataModelTypeDefs
   * @returns
   */
  buildBindings(
    externalId: string,
    dataModelVersion: DataModelVersion,
    dataModelTypeDefs: DataModelTypeDefs
  ): DataModelStorageBindingsDTO[] {
    // code for building bindings
    const bindings: DataModelStorageBindingsDTO[] = [];

    dataModelTypeDefs.types
      // don't generate DMS storage for inline types
      .filter((def) => !this.isInlineType(def))
      .forEach((def) => {
        const typeName = def.name; // DataModelType name

        bindings.push({
          targetName: typeName,
          dataModelStorageSource: {
            externalId: this.getVersionedExternalId(
              typeName,
              dataModelVersion.version
            ),
            space: externalId,
          },
        });
      });

    return bindings;
  }

  buildModels(
    externalId: string,
    dataModelVersion: DataModelVersion,
    dataModelTypeDefs: DataModelTypeDefs
  ): DataModelStorageModelsDTO {
    const typesMap = {} as KeyValueMap;
    mixerApiBuiltInTypes.forEach((type) => {
      if (type.type === 'SCALAR' || type.type === 'OBJECT') {
        typesMap[type.name] = type.dmsType;
      }
    });

    // set propert type here
    const generatedStorageTypes = {
      spaceExternalId: externalId,
      items: [],
    } as DataModelStorageModelsDTO;

    dataModelTypeDefs.types
      // don't generate DMS storage for inline types
      .filter((def) => !this.isInlineType(def))
      .forEach((def) => {
        const typeName = def.name; // DataModelType name
        const table = {
          externalId: this.getVersionedExternalId(
            typeName,
            dataModelVersion.version
          ),
          properties: {},
        } as DataModelStorageModel;

        def.fields.forEach((field) => {
          const fieldName = field.name;
          const propType = field.type.name as string;
          const isNullable = !field.type.nonNull;
          const isList = field.type.list;

          // IN case if the type is complex type (custom type, not a primitive) ex: Person
          // eslint-disable-next-line no-prototype-builtins
          const isCustomType = !typesMap.hasOwnProperty(propType);

          const property = {
            type: isCustomType
              ? 'direct_relation'
              : isList
              ? typesMap[propType] + '[]'
              : typesMap[propType],
            nullable: isNullable,
          } as DmsModelProperty;

          if (isCustomType) {
            property.targetModel = [
              externalId,
              `${this.getVersionedExternalId(
                propType,
                dataModelVersion.version
              )}`,
            ];
          }

          table.properties[fieldName] = property;
        });

        generatedStorageTypes.items.push(table);
      });

    return generatedStorageTypes;
  }

  private isInlineType(typeDef: DataModelTypeDefsType): boolean {
    return (
      typeDef.directives !== undefined &&
      typeDef.directives.length > 0 &&
      typeDef.directives.some(
        (directive) => directive.name === mixerApiInlineTypeDirectiveName
      )
    );
  }

  private getVersionedExternalId(name: string, version: string): string {
    return `${name}_${version}`;
  }
}
