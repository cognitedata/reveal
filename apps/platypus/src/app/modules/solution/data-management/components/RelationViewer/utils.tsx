import { DataModelTypeDefs, FdmMixerApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';

export const getRelationshipsForData = async ({
  dataModelTypeDefs,
  typeName,
  dataModelExternalId,
  space,
  version,
  externalId,
}: {
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelExternalId: string;
  space: string;
  version: string;
  typeName: string;
  externalId: string;
}) => {
  const currentType = dataModelTypeDefs.types.find(
    (el) => el.name === typeName
  );
  if (currentType) {
    const fields = currentType.fields.filter((field) => field.type.custom);
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
        }ById(instance: {space: "${space}", externalId: "${externalId}"}) {
          items {
            __typename
            externalId
            ${fields
              .map((field) => {
                const subFields = dataModelTypeDefs.types
                  .find((type) => type.name === field.type.name)
                  ?.fields.filter((el) => !el.type.custom)
                  .map((el) => {
                    switch (el.type.name) {
                      case 'TimeSeries':
                        return `${el.name} { __typename externalId }`;
                      default:
                        return el.name;
                    }
                  })
                  .join('\n');
                if (field.type.list) {
                  return `${field.name} { 
                    items { 
                      __typename
                      externalId
                      ${subFields}
                    }
                  }`;
                }
                return `${field.name} { 
                  __typename
                  externalId
                  ${subFields}
                }`;
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
