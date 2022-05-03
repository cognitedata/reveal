import { IntrospectionQuery } from 'graphql';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { CdfMockDatabase, CdfResourceObject } from '../../../types';
import {
  filterCollection,
  flattenNestedObjArray,
  objToFilter,
} from '../../../utils';

export interface FetchAndQueryDataProps {
  globalDb: CdfMockDatabase;
  templateDb: CdfResourceObject;
  schemaType: string;
  schemaFieldName?: string;
  refObj?: unknown;
  isBuiltInType: boolean;
  isFetchingObject: boolean;
  filterParams?: any;
  parsedSchema?: IntrospectionQuery;
}
export function fetchAndQueryData(
  props: FetchAndQueryDataProps
): CdfResourceObject[] {
  const {
    globalDb,
    templateDb,
    isBuiltInType,
    schemaType,
    refObj,
    schemaFieldName,
    isFetchingObject,
    filterParams,
    parsedSchema,
  } = props;
  // const storeKey = isBuiltInType ? config.builtInTypes[schemaType] : schemaType;
  const storeKey = schemaType;

  const dataStore = isBuiltInType
    ? CdfDatabaseService.from(globalDb, storeKey).getState()
    : templateDb.db[storeKey];

  let data = dataStore;

  if (refObj) {
    const relation = refObj[schemaFieldName];
    const relationParams = isFetchingObject
      ? objToFilter(relation)
      : objToFilter(flattenNestedObjArray(relation, false));

    data = filterCollection(data, relationParams) as CdfResourceObject[];
  }

  if (filterParams) {
    if (filterParams._filter) {
      filterParams.filter = filterParams._filter;
      delete filterParams._filter;
    }
    const filters =
      filterParams && filterParams.filter ? filterParams.filter : {};

    data = filterCollection(
      data,
      filters as any,
      parsedSchema
    ) as CdfResourceObject[];

    if (filterParams.limit) {
      data = data.slice(0, filterParams.limit);
    }
  }

  return data;
}
