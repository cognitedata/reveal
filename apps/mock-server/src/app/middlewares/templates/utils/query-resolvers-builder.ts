/* eslint-disable @typescript-eslint/no-explicit-any */
import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { config } from '../../../config';
import { CdfMockDatabase, CdfResourceObject } from '../../../types';
import {
  filterCollection,
  flattenNestedObjArray,
  getType,
  isObjectContainingPrimitiveValues,
  objToFilter,
} from '../../../utils';
import { camelize } from '../../../utils/text-utils';
import { longScalar } from '../../../utils/graphql/custom-scalars';
import {
  assetFieldsResolver,
  synteticTimeSeriesFieldsResolver,
  timeSeriesFieldsResolver,
} from './built-in-types-resolvers';
import { aggregateDatapoints } from './timeseries-utils';

export interface BuildQueryResolversParams {
  version: number;
  templategroups_id: string;
  tablesList: string[];
  parsedSchema: IntrospectionQuery;
  db: CdfMockDatabase;
}
export const buildQueryResolvers = (params: BuildQueryResolversParams) => {
  const resolvers = {
    Long: longScalar,
    Query: {},
    Asset: assetFieldsResolver(params.db),
    TimeSeries: timeSeriesFieldsResolver(params.db),
    SyntheticTimeSeries: synteticTimeSeriesFieldsResolver(params.db),
    AggregationResult: {
      sum: (values) => {
        return aggregateDatapoints(values, (prev, cur) => ({
          ...prev,
          value: prev.value + cur.value,
        }));
      },
      count: (values) => {
        return aggregateDatapoints(values, (prev) => ({
          ...prev,
          value: prev.value + 1,
        }));
      },
      max: (values) => {
        return aggregateDatapoints(values, (prev, cur) =>
          prev.value > cur.value ? prev : cur
        );
      },
      min: (values) => {
        return aggregateDatapoints(values, (prev, cur) =>
          prev.value !== 0 && prev.value < cur.value ? prev : cur
        );
      },
      average: (values) => {
        return aggregateDatapoints(
          values,
          (prev, cur) => ({
            ...prev,
            value: prev.value + cur.value,
          }),
          (aggregatedDatapoint, datapointsList) => ({
            ...aggregatedDatapoint,
            value: aggregatedDatapoint.value / datapointsList.length,
          })
        );
      },
    },
  };

  const store = CdfDatabaseService.from(params.db, 'templates');

  const templateDb = store.find({
    templategroups_id: params.templategroups_id,
    version: params.version,
  });

  params.tablesList.forEach((table) => {
    resolvers.Query[`${camelize(table)}Query`] = (prm, filterParams) => {
      const items = fetchAndQueryData({
        globalDb: params.db,
        templateDb,
        isBuiltInType: false,
        schemaType: table,
        isFetchingObject: false,
        filterParams: filterParams,
        parsedSchema: params.parsedSchema,
      });

      return {
        items,
        cursor: '',
      };
    };

    const tableResolver = {};

    tableResolver['_externalId'] = (refObj) => {
      return refObj['externalId'] || '';
    };
    tableResolver['_dataSetId'] = (refObj) => {
      return refObj['dataSetId'] || 0;
    };

    const builtInTypes = Object.keys(config.builtInTypes);

    (
      params.parsedSchema['__schema'].types.find(
        (type) => type.name === table
      ) as IntrospectionObjectType
    ).fields.forEach((field) => {
      const mutedKind =
        field.type.kind === 'NON_NULL' ? field.type.ofType : field.type;
      const mutedType = field.type as any;
      const fieldKind = mutedKind.kind;
      const fieldSchemaType = mutedType.ofType
        ? getType(mutedType.ofType)
        : (field.type as any).name;

      const fieldName = field.name;
      const isBuiltInType = builtInTypes.includes(fieldSchemaType);

      if (fieldKind === 'OBJECT') {
        tableResolver[fieldName] = (ref) => {
          // Fix for inline types
          if (!isBuiltInType && !params.tablesList.includes(fieldSchemaType)) {
            return ref[fieldName];
          }

          const results = fetchAndQueryData({
            globalDb: params.db,
            templateDb,
            isBuiltInType,
            refObj: ref,
            schemaType: fieldSchemaType,
            schemaFieldName: fieldName,
            isFetchingObject: true,
          });
          return results[0];
        };
      }

      if (fieldKind === 'LIST') {
        tableResolver[field.name] = (ref, prms) => {
          // Fix for inline types
          if (!isBuiltInType && !params.tablesList.includes(fieldSchemaType)) {
            return ref[fieldName];
          }

          return fetchAndQueryData({
            globalDb: params.db,
            templateDb,
            isBuiltInType,
            refObj: ref,
            schemaType: fieldSchemaType,
            schemaFieldName: fieldName,
            isFetchingObject: false,
            filterParams: prms,
          });
        };
      }
    });

    resolvers[table] = tableResolver;
  });

  return resolvers;
};

interface FetchAndQueryDataProps {
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
function fetchAndQueryData(props: FetchAndQueryDataProps): CdfResourceObject[] {
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
  const storeKey = isBuiltInType ? config.builtInTypes[schemaType] : schemaType;

  const dataStore = isBuiltInType
    ? CdfDatabaseService.from(globalDb, storeKey).getState()
    : templateDb.db[storeKey];

  let data = dataStore;

  if (refObj) {
    const relation = refObj[schemaFieldName];

    if (
      (!isFetchingObject && !relation) ||
      (!isFetchingObject && !relation.length)
    ) {
      return [];
    }

    if (
      !isFetchingObject &&
      relation.length &&
      isObjectContainingPrimitiveValues(relation)
    ) {
      return relation;
    }
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
