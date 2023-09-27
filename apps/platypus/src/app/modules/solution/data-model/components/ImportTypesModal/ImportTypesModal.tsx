import { useEffect, useState } from 'react';

import { DataModel, DataModelVersion } from '@platypus/platypus-core';
import { FormLabel } from '@platypus-app/components/FormLabel/FormLabel';
import { Notification } from '@platypus-app/components/Notification/Notification';
import {
  useDataModels,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { GraphqlCodeEditor } from '@platypus-app/modules/solution/data-model/components/GraphqlCodeEditor/GraphqlCodeEditor';
import { parse, DocumentNode, print, Kind } from 'graphql';

import sdk from '@cognite/cdf-sdk-singleton';
import {
  Flex,
  Modal,
  OptionType,
  Select,
  Checkbox,
  CheckboxGroup,
} from '@cognite/cogs.js';

export interface ImportTypesModalProps {
  onClose: () => void;
}

interface VersionedType {
  version: string;
  name: string;
  space: string;
}

const createSubsetOfDataModelBasedOnSelection = (
  selectedTypes: string[],
  selectedDataModel?: DataModelVersion,
  query?: DocumentNode
) => {
  // Create a GraphQL data model for the selected types
  // We update the directives to include @view with version, in addition to @import
  if (!query) {
    return undefined;
  }

  const definitions = query.definitions.filter((definition) =>
    selectedTypes.includes((definition as any).name.value)
  );

  definitions.forEach((definition) => {
    // The definitions are our types
    if (!selectedDataModel) {
      return;
    }

    const importDirective: any = {
      kind: Kind.DIRECTIVE,
      name: {
        kind: Kind.NAME,
        value: 'import',
      },
      arguments: [
        {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: 'dataModel',
          },
          value: {
            kind: Kind.OBJECT,
            fields: [
              {
                kind: Kind.OBJECT_FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'externalId',
                },
                value: {
                  kind: Kind.STRING,
                  value: selectedDataModel.externalId,
                },
              },
              {
                kind: Kind.OBJECT_FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'version',
                },
                value: { kind: Kind.STRING, value: selectedDataModel.version },
              },
              {
                kind: Kind.OBJECT_FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'space',
                },
                value: { kind: Kind.STRING, value: selectedDataModel.space },
              },
            ],
          },
        },
      ],
    };

    // Remove any potential existing view directive and import directive as we will replace them
    (definition as any).directives = (definition as any).directives.filter(
      (directive: any) =>
        directive.name.value !== 'view' && directive.name.value !== 'import'
    );
    (definition as any).directives.push(importDirective);
  });

  const newQuery = {
    ...query,
    definitions,
  };
  return newQuery;
};

export const ImportTypesModal: React.FC<ImportTypesModalProps> = (props) => {
  const { t } = useTranslation('DataModelImportTypesModal');
  const [selectedDataModel, setSelectedDataModel] = useState<
    DataModel | undefined
  >();

  const [selectedDataModelVersion, setSelectedDataModelVersion] = useState<
    DataModelVersion | undefined
  >();
  const { data: dataModels } = useDataModels();
  const { track } = useMixpanel();

  const { data: dataModelVersions } = useDataModelVersions(
    selectedDataModel?.id || '',
    selectedDataModel?.space || ''
  );

  const [query, setQuery] = useState<DocumentNode | undefined>(undefined);
  const [versionedTypes, setVersionedTypes] = useState<VersionedType[]>([]);

  // The types user has selected
  const [selectedTypesForImport, setSelectedTypesForImport] = useState<
    string[]
  >([]);

  // Extra types we depend on
  const [dependencyTypesForImport, setDependencyTypesForImport] = useState<
    string[]
  >([]);

  const selectedTypesQuery = createSubsetOfDataModelBasedOnSelection(
    [...selectedTypesForImport, ...dependencyTypesForImport],
    selectedDataModelVersion,
    query
  );

  const graphQlCodeForImport =
    selectedTypesForImport.length > 0 && selectedTypesQuery
      ? `#region IMPORT BEGIN (${selectedDataModelVersion?.space}:${
          selectedDataModelVersion?.externalId
        }:${selectedDataModelVersion?.version})\n#  Space: ${
          selectedDataModelVersion?.space
        }\n#  Data model: ${selectedDataModelVersion?.name} (${
          selectedDataModelVersion?.externalId
        })\n#  Version: ${selectedDataModelVersion?.version}\n\n ${print(
          selectedTypesQuery
        )}\n\n#endregion IMPORT END\n\n`
      : '  ';

  useEffect(() => {
    // When a user selects a set of types to import, these types may refer to other types that are not selected.
    // We should also import these since they are a dependency of the selected types.
    if (query) {
      const extraDependencyTypesForImport = new Set<string>();

      let definitionSubset: any = query.definitions.filter((definition) =>
        selectedTypesForImport.includes((definition as any).name.value)
      );

      let didAddNewTypes = true;
      while (didAddNewTypes) {
        // Repeat until we added the full dependency tree
        didAddNewTypes = false;
        for (const definition of definitionSubset) {
          for (const field of definition.fields) {
            if (field.type.kind === 'NamedType') {
              // Add if is a direct relation and not already added to extraDependencyTypesForImport
              // e.g. pump: Pump
              if (!extraDependencyTypesForImport.has(field.type.name.value)) {
                extraDependencyTypesForImport.add(field.type.name.value);
                didAddNewTypes = true;
              }
            } else if (field.type.kind === 'ListType') {
              if (
                field.type.type.kind === 'NamedType' &&
                !extraDependencyTypesForImport.has(field.type.type.name.value)
              ) {
                // Add if is a connection and not already added
                // e.g. pumps: [Pump]
                extraDependencyTypesForImport.add(field.type.type.name.value);
                didAddNewTypes = true;
              }
            }
          }
        }

        // Update the definition subset to include all newly added types
        definitionSubset = query.definitions.filter((definition) =>
          Array.from(extraDependencyTypesForImport).includes(
            (definition as any).name.value
          )
        );
      }

      // All types in selectedTypesForImport are actively chosen by user, so these should be possible to uncheck
      // Remove them from the dependency list
      setDependencyTypesForImport(
        Array.from(extraDependencyTypesForImport).filter(
          (type) => !selectedTypesForImport.includes(type)
        )
      );
    }
  }, [selectedTypesForImport, query]);

  useEffect(() => {
    // Always select first data model in list
    if (dataModels?.length) {
      setSelectedDataModel(dataModels[0]);
    }
  }, [dataModels]);

  useEffect(() => {
    // Always select first data model version in list
    if (dataModelVersions?.length) {
      setSelectedDataModelVersion(dataModelVersions[0]);
    }
  }, [dataModelVersions]);

  useEffect(() => {
    // Need to fetch the views and versions for the selected data model version
    if (selectedDataModelVersion) {
      (async () => {
        const version = await sdk.post(
          `/api/v1/projects/${sdk.project}/models/datamodels/byids`,
          {
            data: {
              items: [
                {
                  externalId: selectedDataModelVersion.externalId,
                  space: selectedDataModelVersion.space,
                  version: selectedDataModelVersion.version,
                },
              ],
            },
          }
        );
        setVersionedTypes(
          version.data.items[0].views.map((view: any) => ({
            version: view.version,
            name: view.externalId,
            space: view.space,
          }))
        );

        setQuery(parse(selectedDataModelVersion.schema));
      })();
    }
  }, [selectedDataModelVersion]);

  const handleCopyClick = () => {
    track('DataModel.ImportTypesCopied');
    navigator.clipboard.writeText(graphQlCodeForImport);
    Notification({
      type: 'success',
      message: t(
        'data_model_endpoint_modal_copied_toast_message',
        'Copied to clipboard'
      ),
    });
  };

  return (
    <Modal
      visible
      size="large"
      title={t(
        'import_types_modal_title',
        'Import types from another data model'
      )}
      subtitle={t(
        'import_types_modal_subtitle',
        'Generate GraphQL code to import types from another data model. All dependencies will be included.'
      )}
      onOk={handleCopyClick}
      onCancel={props.onClose}
      cancelText="Close"
      okText="Copy code"
    >
      <Flex direction="row">
        <Flex direction="column">
          <FormLabel level={2} strong>
            {t('select_data_model', 'Select data model')}
          </FormLabel>
          <Select
            width={300}
            onChange={(spaceOption: OptionType<string>) => {
              setSelectedDataModel(
                dataModels?.filter(
                  (dataModel) => dataModel.id === spaceOption.value
                )[0]
              );
              setSelectedDataModelVersion(undefined);
              setVersionedTypes([]);
              setSelectedTypesForImport([]);
            }}
            value={
              selectedDataModel
                ? {
                    value: selectedDataModel.id,
                    label: selectedDataModel.name,
                  }
                : undefined
            }
            options={
              dataModels?.map((dataModel) => ({
                value: dataModel.id,
                label: dataModel.name,
              })) || []
            }
          />
          <FormLabel level={2} strong>
            {t('select_version', 'Select version')}
          </FormLabel>
          <Select
            width={300}
            value={
              selectedDataModelVersion
                ? {
                    value: selectedDataModelVersion.version,
                    label: selectedDataModelVersion.version,
                  }
                : undefined
            }
            onChange={(spaceOption: OptionType<string>) => {
              setSelectedDataModelVersion(
                dataModelVersions?.filter(
                  (dataModelVersion) =>
                    dataModelVersion.version === spaceOption.value
                )[0]
              );
              setVersionedTypes([]);
              setSelectedTypesForImport([]);
            }}
            options={
              dataModelVersions?.map((version) => ({
                value: version.version,
                label: version.version,
              })) || []
            }
          />
          <FormLabel level={2} strong>
            {t('select_types_to_import', 'Select types to import')}
          </FormLabel>

          <CheckboxGroup>
            {versionedTypes.map((versionedType) => (
              <Checkbox
                checked={
                  selectedTypesForImport.includes(versionedType.name) ||
                  dependencyTypesForImport.includes(versionedType.name)
                }
                disabled={dependencyTypesForImport.includes(versionedType.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Add to selected types
                    setSelectedTypesForImport([
                      ...selectedTypesForImport,
                      versionedType.name,
                    ]);
                  } else {
                    // Remove from selected types
                    setSelectedTypesForImport(
                      selectedTypesForImport.filter(
                        (type) => type !== versionedType.name
                      )
                    );
                  }
                }}
                label={`${versionedType.name} [${versionedType.version}]`}
              />
            ))}
          </CheckboxGroup>
        </Flex>
        <Flex direction="column" style={{ flex: 1 }}>
          <div
            style={{
              width: '100%',
              minHeight: '500px',
              height: '100%',
              flex: 1,
            }}
          >
            <GraphqlCodeEditor code={graphQlCodeForImport} disabled />
          </div>
        </Flex>
      </Flex>
    </Modal>
  );
};
