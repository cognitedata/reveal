/* eslint-disable @typescript-eslint/no-explicit-any */
import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { config } from '../../../../config';
import { CdfMockDatabase, CdfResourceObject } from '../../../../types';
import {
  filterCollection,
  flattenNestedObjArray,
  getType,
  isObjectContainingPrimitiveValues,
  objToFilter,
  sortCollection,
} from '../../../../utils';
import { capitalize } from '../../../../utils/text-utils';
import { DmsBinding } from '../../types';

export interface BuildQueryResolversParams {
  version: number;
  externalId: string;
  tablesList: string[];
  parsedSchema: IntrospectionQuery;
  db: CdfMockDatabase;
}
export const buildQueryResolvers = (params: BuildQueryResolversParams) => {
  const resolvers = {
    Query: {},
  };

  const store = CdfDatabaseService.from(params.db, 'schema');

  const templateDb = store.find({
    externalId: params.externalId,
  });

  const templateVersion = (templateDb as any).versions.find(
    (v) => v.version === params.version
  );

  params.tablesList.forEach((table) => {
    // storage could have different name in schema service
    // make sure that we read the right table
    let storageTableName = table;
    if (
      templateVersion?.bindings?.find(
        (bindingsItem) => bindingsItem.targetName === table
      )
    ) {
      const tableBinding = templateVersion?.bindings.find(
        (bindingsItem) => bindingsItem.targetName === table
      );
      storageTableName = tableBinding
        ? getDataModelStorageExternalId(tableBinding)
        : table;
    }

    resolvers.Query[`list${capitalize(table)}`] = (prm, filterParams) => {
      let items = fetchAndQueryData({
        globalDb: params.db,
        templateDb,
        isBuiltInType: false,
        schemaType: storageTableName,
        isFetchingObject: false,
        filterParams: filterParams,
        parsedSchema: params.parsedSchema,
      });

      if (filterParams.sort) {
        items = sortCollection(items, filterParams.sort);
      }

      return {
        items,
        edges: items.map((item) => ({ node: item })),
        pageInfo: {
          endCursor: undefined,
          startCursor: undefined,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    };

    const tableResolver = {};

    tableResolver['externalId'] = (refObj) => {
      return refObj['externalId'] || '';
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

      // storage could have different name in schema service
      // make sure that we read the right table
      let fieldStorageTableName = fieldSchemaType;
      if (
        templateVersion?.bindings &&
        templateVersion?.bindings.find(
          (bindingsItem) => bindingsItem.targetName === table
        )
      ) {
        const fieldStorageTableBinding = templateVersion?.bindings.find(
          (bindingsItem) => bindingsItem.targetName === fieldSchemaType
        );
        fieldStorageTableName = fieldStorageTableBinding
          ? getDataModelStorageExternalId(fieldStorageTableBinding)
          : fieldSchemaType;
      }

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
            schemaType: fieldStorageTableName,
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

          const listData = fetchAndQueryData({
            globalDb: params.db,
            templateDb,
            isBuiltInType,
            refObj: ref,
            schemaType: fieldStorageTableName,
            schemaFieldName: fieldName,
            isFetchingObject: false,
            filterParams: prms,
          });

          return listData;
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

export const getDataModelStorageExternalId = (binding: DmsBinding) => {
  return binding.dataModelStorageMappingSource.filter.and[0].hasData
    .models[0][1];
};
