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
  paginateCollection,
  sortCollection,
} from '../../../../utils';
import { capitalize } from '../../../../utils/text-utils';
import { DmsBinding } from '../../types';

export interface BuildQueryResolversParams {
  version: number;
  externalId: string;
  space: string;
  tablesList: string[];
  parsedSchema: IntrospectionQuery;
  db: CdfMockDatabase;
}
export const buildDmsV3QueryResolvers = (params: BuildQueryResolversParams) => {
  const resolvers = {
    Query: {},
  };

  const instancesDb = CdfDatabaseService.from(
    params.db,
    'instances'
  ).getState();
  const dataModelsDb = CdfDatabaseService.from(params.db, 'datamodels');

  const dataModelVersion = dataModelsDb.find({
    externalId: params.externalId,
    version: params.version,
    space: params.space,
  });

  params.tablesList.forEach((table) => {
    // storage could have different name in schema service
    // make sure that we read the right table
    const storageTableName = table;

    resolvers.Query[`aggregate${capitalize(table)}`] = (prm, filterParams) => {
      const items = fetchAndQueryData({
        globalDb: params.db,
        templateDb: instancesDb,
        isBuiltInType: false,
        schemaType: {
          space: params.space,
          view: storageTableName,
        },
        isFetchingObject: false,
        filterParams: filterParams,
        parsedSchema: params.parsedSchema,
      });
      return {
        edges: items.map((item) => ({ node: item })),
        pageInfo: {
          endCursor: undefined,
          startCursor: undefined,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        items: [
          {
            count: {
              externalId: items.length,
            },
          },
        ],
      };
    };
    resolvers.Query[`list${capitalize(table)}`] = (prm, filterParams) => {
      let items = fetchAndQueryData({
        globalDb: params.db,
        templateDb: instancesDb,
        isBuiltInType: false,
        schemaType: {
          space: params.space,
          view: table,
        },
        isFetchingObject: false,
        filterParams: filterParams,
        parsedSchema: params.parsedSchema,
      });

      if (filterParams.sort) {
        items = sortCollection(items, filterParams.sort);
      }

      return paginateCollection(items, filterParams.first, filterParams.after);
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

      // edge case, it seems that GraphQL have some reserved word when using User as a type
      if (fieldStorageTableName === 'UserType') {
        fieldStorageTableName = 'User';
      }

      if (fieldKind === 'OBJECT') {
        tableResolver[fieldName] = (ref) => {
          // Fix for inline types
          if (!isBuiltInType && !params.tablesList.includes(fieldSchemaType)) {
            return ref[fieldName];
          }

          const results = fetchAndQueryData({
            globalDb: params.db,
            templateDb: instancesDb,
            isBuiltInType,
            refObj: ref,
            schemaType: {
              space: params.space,
              view: fieldStorageTableName,
            },
            schemaFieldName: fieldName,
            isFetchingObject: true,
          });

          return results[0];
        };
      }

      if (fieldKind === 'LIST') {
        tableResolver[field.name] = (ref, filterParams) => {
          // Fix for inline types
          if (!isBuiltInType && !params.tablesList.includes(fieldSchemaType)) {
            return ref[fieldName];
          }

          let items = fetchAndQueryData({
            globalDb: params.db,
            templateDb: instancesDb,
            isBuiltInType,
            refObj: ref,
            schemaType: {
              space: params.space,
              view: fieldStorageTableName,
            },
            schemaFieldName: fieldName,
            isFetchingObject: false,
            filterParams,
          });

          if (filterParams.sort) {
            items = sortCollection(items, filterParams.sort);
          }

          return paginateCollection(
            items,
            filterParams.first,
            filterParams.after
          );
        };
      }
    });

    resolvers[table] = tableResolver;
  });

  return resolvers;
};

interface FetchAndQueryDataProps {
  globalDb: CdfMockDatabase;
  templateDb: CdfResourceObject[];
  schemaType: {
    view: string;
    space: string;
  };
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

  let data = templateDb.filter(
    (item) =>
      item['_metadata_space'] === schemaType.space &&
      item['_metadata_view'] === schemaType.view
  );

  if (refObj) {
    const relation = refObj[schemaFieldName];
    if (
      (!isFetchingObject && !relation) ||
      (!isFetchingObject && !relation.length)
    ) {
      return [];
    }

    if (relation === null && isFetchingObject) {
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
