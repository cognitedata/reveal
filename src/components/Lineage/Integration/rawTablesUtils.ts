import moment from 'moment';
import sdk from '@cognite/cdf-sdk-singleton';
import { RawIntegrationWithUpdateTime } from 'components/Lineage/Integration/IntegrationRawTables';
import { DataSet, Integration, RawTableWithIntegrations } from 'utils/types';

export const updateRawTableWithLastUpdate = async (
  value: RawTableWithIntegrations
): Promise<RawIntegrationWithUpdateTime> => {
  const { databaseName, tableName, integrations } = value;
  try {
    const results = await sdk.raw.listRows(databaseName, tableName);
    const lastUpdate =
      results.items.length > 0
        ? moment(results.items[0].lastUpdatedTime).fromNow()
        : 'Never';
    return {
      databaseName,
      tableName,
      integrations,
      lastUpdate,
    } as RawIntegrationWithUpdateTime;
  } catch (e) {
    return {
      databaseName,
      tableName,
      integrations,
      lastUpdate: 'This RAW table may be deleted.',
    } as RawIntegrationWithUpdateTime;
  }
};

const addIntegrationsRawTables = (
  allRawTablesMap: Map<string, RawTableWithIntegrations>,
  integrations: Integration[]
) => {
  if (Array.isArray(integrations)) {
    integrations.forEach((integration) => {
      const { rawTables } = integration;
      if (rawTables) {
        rawTables.forEach(({ dbName, tableName }) => {
          const mapKey = `${dbName}-${tableName}`;
          if (allRawTablesMap.has(mapKey)) {
            const tableWithIntegrations = allRawTablesMap.get(mapKey)!;
            if (
              !tableWithIntegrations.integrations.find(
                ({ id }) => id === integration.id
              )
            ) {
              allRawTablesMap.set(mapKey, {
                databaseName: dbName,
                tableName,
                integrations: [
                  ...tableWithIntegrations.integrations,
                  integration,
                ],
              });
            }
          } else {
            allRawTablesMap.set(mapKey, {
              databaseName: dbName,
              tableName,
              integrations: [integration],
            });
          }
        });
      }
    });
  }
  return Array.from(allRawTablesMap.values());
};

const addDataSetRawTables = (
  dataSet: DataSet | undefined
): Map<string, RawTableWithIntegrations> => {
  return new Map(
    Array.isArray(dataSet?.metadata.rawTables)
      ? dataSet?.metadata.rawTables?.map(({ databaseName, tableName }) => {
          const key = `${databaseName}-${tableName}`;
          return [key, { databaseName, tableName, integrations: [] }];
        })
      : undefined
  );
};

export const combineDataSetAndIntegrationsRawTables = (
  dataSet: DataSet | undefined
): RawTableWithIntegrations[] => {
  const raws: Map<string, RawTableWithIntegrations> = dataSet?.metadata
    ?.rawTables
    ? addDataSetRawTables(dataSet)
    : new Map();

  return dataSet?.metadata.integrations
    ? addIntegrationsRawTables(raws, dataSet?.metadata.integrations)
    : [];
};
