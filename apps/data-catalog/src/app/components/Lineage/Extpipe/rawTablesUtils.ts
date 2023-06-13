import { DataSetWithExtpipes } from '@data-catalog-app/actions';
import { TranslationKeys } from '@data-catalog-app/common/i18n';
import { RawExtpipeWithUpdateTime } from '@data-catalog-app/components/Lineage/Extpipe/ExtpipeRawTables';
import {
  DataSet,
  Extpipe,
  RawTableWithExtpipes,
} from '@data-catalog-app/utils/types';
import moment from 'moment';

import sdk from '@cognite/cdf-sdk-singleton';

export const updateRawTableWithLastUpdate = async (
  value: RawTableWithExtpipes,
  _t: (key: TranslationKeys) => string
): Promise<RawExtpipeWithUpdateTime> => {
  const { databaseName, tableName, extpipes } = value;
  try {
    const results = await sdk.raw.listRows(databaseName, tableName);
    const lastUpdate =
      results.items.length > 0
        ? moment(results.items[0].lastUpdatedTime).fromNow()
        : '–';
    return {
      databaseName,
      tableName,
      extpipes,
      lastUpdate,
    } as RawExtpipeWithUpdateTime;
  } catch (e) {
    return {
      databaseName,
      tableName,
      extpipes,
      lastUpdate: _t('this-raw-table-may-be-deleted'),
    } as RawExtpipeWithUpdateTime;
  }
};

const addExtpipesRawTables = (
  allRawTablesMap: Map<string, RawTableWithExtpipes>,
  extpipes: Extpipe[]
) => {
  if (Array.isArray(extpipes)) {
    extpipes.forEach((extpipe) => {
      const { rawTables } = extpipe;
      if (rawTables) {
        rawTables.forEach(({ dbName, tableName }) => {
          const mapKey = `${dbName}-${tableName}`;
          if (allRawTablesMap.has(mapKey)) {
            const tableWithExtpipes = allRawTablesMap.get(mapKey)!;
            if (
              !tableWithExtpipes.extpipes.find(({ id }) => id === extpipe.id)
            ) {
              allRawTablesMap.set(mapKey, {
                databaseName: dbName,
                tableName,
                extpipes: [...tableWithExtpipes.extpipes, extpipe],
              });
            }
          } else {
            allRawTablesMap.set(mapKey, {
              databaseName: dbName,
              tableName,
              extpipes: [extpipe],
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
): Map<string, RawTableWithExtpipes> => {
  return new Map(
    Array.isArray(dataSet?.metadata.rawTables)
      ? dataSet?.metadata.rawTables?.map(({ databaseName, tableName }) => {
          const key = `${databaseName}-${tableName}`;
          return [key, { databaseName, tableName, extpipes: [] }];
        })
      : undefined
  );
};

export const combineDataSetAndExtpipesRawTables = (
  dataSetWithExtpipes: DataSetWithExtpipes
): RawTableWithExtpipes[] => {
  const { dataSet, extpipes } = dataSetWithExtpipes;
  const raws: Map<string, RawTableWithExtpipes> = dataSet?.metadata?.rawTables
    ? addDataSetRawTables(dataSet)
    : new Map();

  return extpipes ? addExtpipesRawTables(raws, extpipes) : [];
};
