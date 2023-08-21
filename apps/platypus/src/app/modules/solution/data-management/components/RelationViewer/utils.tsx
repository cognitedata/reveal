import { DataModelTypeDefs, FdmMixerApiService } from '@platypus/platypus-core';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';

export const getRelationshipsForData = async ({
  dataModelTypeDefs,
  typeName,
  dataModelExternalId,
  instanceSpace,
  space,
  version,
  externalId,
}: {
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelExternalId: string;
  instanceSpace: string;
  space: string;
  version: string;
  typeName: string;
  externalId: string;
}) => {
  const currentType = dataModelTypeDefs.types.find(
    (el) => el.name === typeName
  );
  if (currentType) {
    const fields = currentType.fields.filter(
      (field) =>
        field.type.custom ||
        field.type.name === 'TimeSeries' ||
        field.type.name === 'File'
    );
    const mixerAPI = new FdmMixerApiService(getCogniteSDKClient());
    return mixerAPI
      .runQuery({
        dataModelId: dataModelExternalId,
        space,
        schemaVersion: version,
        graphQlParams: {
          query: `query {
        get${
          currentType.name
        }ById(instance: {space: "${instanceSpace}", externalId: "${externalId}"}) {
          items {
            __typename
            externalId
            space
            ${fields
              .map((field) => {
                const subFields = (
                  dataModelTypeDefs.types
                    .find((type) => type.name === field.type.name)
                    ?.fields.filter((el) => !el.type.custom) || []
                )
                  .map((el) => {
                    switch (el.type.name) {
                      case 'TimeSeries':
                      case 'File':
                      case 'Sequence':
                        // no need for datapoints in nested level
                        return `${el.name} { __typename name id externalId }`;
                      default:
                        return el.name;
                    }
                  })
                  .join('\n');
                switch (field.type.name) {
                  case 'TimeSeries':
                    return `${field.name} {
                      __typename
                      externalId
                      id
                      name
                      dataPoints(limit: 10) {
                        timestamp
                        value
                      }
                    }`;
                  case 'Sequence':
                    return `${field.name} {
                      __typename
                      externalId
                      id
                      latest {
                        rows {
                          rowNumber
                          values
                        }
                        externalId
                        columns {
                          externalId
                          name
                          valueType
                        }
                      }
                    }`;
                  case 'File':
                    return `${field.name} {
                      __typename
                      externalId
                      id
                      name
                      downloadLink {
                        downloadUrl
                      }
                    }`;
                  default:
                    if (field.type.list) {
                      return `${field.name} { 
                        items { 
                          __typename
                          externalId
                          space
                          ${subFields}
                        }
                      }`;
                    }
                    return `${field.name} { 
                      __typename
                      externalId
                      space
                      ${subFields}
                    }`;
                }
              })
              .join('\n')}
          }
        }
    }`,
        },
      })
      .then((data) => {
        const [item] = data.data[`get${currentType.name}ById`].items;
        return item;
      });
  }
  return Promise.resolve(undefined);
};

export const getRelationLinkId = (
  type: string,
  startNode: string,
  endNode: string
) => {
  return `${startNode}-${type}-${endNode}`;
};

export const getNodeId = (node: {
  externalId: string;
  __typename: string;
  space: string;
}) => `${node.space}:${node.__typename}:${node.externalId}`;
