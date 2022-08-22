import {
  DataModelStorageBindingsDTO,
  DataModelStorageBindingsProperty,
} from '../../dto';

import {
  isInlineType,
  getOneToManyModelName,
  getVersionedExternalId,
  isCustomType,
} from '../utils';

import {
  DataModelVersion,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelTypeDefsField,
} from '../../types';

export class MixerBindingsBuilder {
  /**
   * Builds bindings configuration that connects
   * Data Model with DataModelStorage
   * @param dataModel
   * @param dataModelVersion
   * @param dataModelTypeDefs
   * @returns
   */
  build(
    externalId: string,
    dataModelVersion: DataModelVersion,
    dataModelTypeDefs: DataModelTypeDefs
  ): DataModelStorageBindingsDTO[] {
    // code for building bindings
    const bindings: DataModelStorageBindingsDTO[] = [];

    dataModelTypeDefs.types
      // don't generate DMS storage for inline types
      .filter((def) => !isInlineType(def))
      .forEach((def) => {
        const binding = this.buildDataModelStorageBinding(
          def,
          externalId,
          dataModelVersion.version
        );

        this.filterOneToManyCustomTypeRelations(def).forEach((field) => {
          const connectionModelName = getOneToManyModelName(
            def,
            field,
            dataModelVersion.version
          );

          binding.dataModelStorageMappingSource.properties.push(
            this.buildOneToManyPropertyBinding(
              field,
              externalId,
              connectionModelName
            )
          );
        });

        bindings.push(binding);
      });

    return bindings;
  }

  private buildOneToManyPropertyBinding(
    field: DataModelTypeDefsField,
    externalId: string,
    connectionModelName: string
  ): DataModelStorageBindingsProperty {
    return {
      as: field.name,
      from: {
        connection: {
          edgeFilter: {
            hasData: {
              models: [[externalId, connectionModelName]],
            },
          },
          outwards: true,
        },
      },
    };
  }

  private buildDataModelStorageBinding(
    type: DataModelTypeDefsType,
    externalId: string,
    version: string
  ): DataModelStorageBindingsDTO {
    const versionedExternalId = getVersionedExternalId(type.name, version);

    return {
      targetName: type.name,
      dataModelStorageMappingSource: {
        filter: {
          and: [
            {
              hasData: {
                models: [[externalId, versionedExternalId]],
              },
            },
          ],
        },
        properties: [
          {
            from: {
              property: [externalId, versionedExternalId, '.*'],
            },
          },
        ],
      },
    };
  }

  private filterOneToManyCustomTypeRelations(type: DataModelTypeDefsType) {
    return type.fields.filter((field) => {
      return isCustomType(field.type.name as string) && field.type.list;
    });
  }
}
