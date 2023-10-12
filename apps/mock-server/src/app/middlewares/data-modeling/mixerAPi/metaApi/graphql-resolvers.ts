import { GraphQLError } from 'graphql';
import { v4 } from 'uuid';

import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { CdfMockDatabase, CdfResourceObject } from '../../../../types';
import { sortCollection } from '../../../../utils';
import {
  Int32Scalar,
  bigIntScalar,
  dataPointValue,
  dateStringScalar,
  float32Scalar,
  float64Scalar,
  longScalar,
  timestampStringScalar,
} from '../../../../utils/graphql/custom-scalars';
import {
  createMockServerKey,
  validateBreakingChanges,
} from '../../utils/graphql-server-utils';
import { fetchAndQueryData } from '../../utils/query-fetcher';
import { buildMockServer } from '../applicationAPI/graphql-mock-server-builder';

export const graphQlMetaApiResolvers = (
  db: CdfMockDatabase,
  graphQlServers: { [name: string]: any }
) => {
  const store = CdfDatabaseService.from(db, 'schema');

  return {
    Timestamp: timestampStringScalar,
    Int32: Int32Scalar,
    Int64: bigIntScalar,
    Float32: float32Scalar,
    Float64: float64Scalar,
    DataPointValue: dataPointValue,
    Date: dateStringScalar,
    Query: {
      listGraphQlDmlVersions: (prm, filterParams) => {
        const dataModelsFilter = { filter: {} };
        if (filterParams.filter) {
          dataModelsFilter.filter = filterParams.filter;
        }
        if (filterParams.space) {
          dataModelsFilter.filter['space'] = { eq: filterParams['space'] };
        }

        let items = fetchAndQueryData({
          globalDb: db,
          templateDb: {},
          isBuiltInType: true,
          schemaType: 'datamodels',
          isFetchingObject: false,
          filterParams: dataModelsFilter,
        });

        // by default, if no external id is provided
        // this api is going to return the latest versions
        // from each data model
        // eslint-disable-next-line
        if (!dataModelsFilter.filter.hasOwnProperty('externalId')) {
          items = sortCollection(items, [{ createdTime: 'DESC' }]);
          // get unique data models
          items = items.filter((value, index, self) => {
            return (
              self.findIndex((v) => v.externalId === value.externalId) === index
            );
          });
        }

        if (filterParams.sort) {
          items = sortCollection(items, filterParams.sort);
        }

        if (filterParams.limit) {
          items = items.slice(0, filterParams.limit);
        }

        const results = items.map((item) => ({
          ...item,
          graphQlDml: item.metadata.graphQlDml,
        }));

        return {
          items: results,
          edges: results.map((result) => ({ node: result })),
        };
      },
      graphQlDmlVersionsById: (prm, params) => {
        let dataModelVersions = fetchAndQueryData({
          globalDb: db,
          templateDb: {},
          isBuiltInType: true,
          schemaType: 'datamodels',
          isFetchingObject: false,
          filterParams: {
            filter: {
              space: { eq: params.space },
            },
          },
        });

        dataModelVersions = sortCollection(dataModelVersions, [
          { createdTime: 'DESC' },
        ]);
        // get unique data models
        dataModelVersions = dataModelVersions.filter(
          (dataModelVersion) =>
            dataModelVersion.externalId === params.externalId
        );

        const results = dataModelVersions.map((dataModelVersion) => ({
          ...dataModelVersion,
          graphQlDml: dataModelVersion.metadata.graphQlDml,
        }));

        return {
          items: results,
          edges: results.map((result) => ({ node: result })),
        };
      },
    },
    Mutation: {
      upsertGraphQlDmlVersion: async (_, req) => {
        const dataModelsStore = CdfDatabaseService.from(db, 'datamodels');
        const { space, externalId, version, name, description, graphQlDml } =
          req.graphQlDmlVersion;

        const serverKey = createMockServerKey(
          `${space}_${externalId}`,
          version
        );

        const dataModelVersion = {
          id: v4(),
          space,
          externalId,
          name,
          description,
          createdTime: Date.now(),
          lastUpdatedTime: Date.now(),
          version: version || '1',
          metadata: {
            graphQlDml: graphQlDml || '',
          },
        };

        const dbDataModelVersion = dataModelsStore.find({
          externalId,
          space,
          version,
        });

        if (dbDataModelVersion && dbDataModelVersion.metadata.graphQlDml) {
          const breakingChanges = await validateBreakingChanges(
            graphQlDml,
            dbDataModelVersion.metadata.graphQlDml as string,
            'upsertGraphQlDmlVersion'
          );

          if (breakingChanges.length) {
            throw new GraphQLError(
              breakingChanges[0].message,
              null,
              null,
              null,
              null,
              null,
              breakingChanges[0].extensions
            );
          }
        }

        dataModelsStore.insert(dataModelVersion);

        if (graphQlDml) {
          graphQlServers[serverKey] = buildMockServer({
            db,
            mockDb: CdfDatabaseService.from(db, 'instances').getState() as any,
            externalId,
            schema: graphQlDml,
            version: dataModelVersion.version,
            space: dataModelVersion.space,
          });
        }

        return { result: { ...dataModelVersion, graphQlDml }, errors: null };
      },
    },
  };
};
