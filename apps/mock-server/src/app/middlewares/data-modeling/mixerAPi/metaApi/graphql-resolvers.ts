import { CdfMockDatabase, CdfResourceObject } from '../../../../types';
import {
  bigIntScalar,
  timestampStringScalar,
} from '../../../../utils/graphql/custom-scalars';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { fetchAndQueryData } from '../../utils/query-fetcher';
import { objToFilter, sortCollection } from '../../../../utils';
import { v4 } from 'uuid';
import {
  createMockServerKey,
  validateBreakingChanges,
} from '../../utils/graphql-server-utils';
import { buildMockServer } from '../applicationAPI/graphql-mock-server-builder';
import { GraphQLError } from 'graphql';

export const graphQlMetaApiResolvers = (
  db: CdfMockDatabase,
  graphQlServers: { [name: string]: any }
) => {
  const store = CdfDatabaseService.from(db, 'schema');

  return {
    Timestamp: timestampStringScalar,
    Int64: bigIntScalar,
    Query: {
      listApis: (prm, filterParams) => {
        const items = fetchAndQueryData({
          globalDb: db,
          templateDb: {},
          isBuiltInType: true,
          schemaType: 'schema',
          isFetchingObject: false,
          filterParams: filterParams,
        });

        return { edges: items.map((item) => ({ node: item })) };
      },
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

        return items.map((item) => ({
          ...item,
          graphQlDml: item.metadata.graphQlDml,
        }));
      },
      getApisByIds: (prm, filterParams) => {
        const filters = { ...filterParams };
        if (filters['externalIds']) {
          filters['externalId'] = filters['externalIds'];
          delete filters['externalIds'];
        }
        const items = fetchAndQueryData({
          globalDb: db,
          templateDb: {},
          isBuiltInType: true,
          schemaType: 'schema',
          isFetchingObject: false,
          filterParams: { _filter: objToFilter(filters) },
        });
        return items;
      },
      validateApiVersionFromGraphQl: async (prm, req) => {
        const { apiExternalId, graphQl } = req.apiVersion;
        const version = req.apiVersion.version || 1;

        const solution = store.find({ externalId: apiExternalId });
        if (!solution) {
          return [];
        }

        const versions = (solution.versions || []) as CdfResourceObject[];

        const currentSchemaVersion = versions.find(
          (schemaVersion: any) => schemaVersion.version === version
        ) as any;

        if (!currentSchemaVersion) {
          return [];
        }

        const breakingChanges = await validateBreakingChanges(
          graphQl,
          currentSchemaVersion.dataModel.graphqlRepresentation,
          'upsertApiVersionFromGraphQl'
        );

        if (breakingChanges.length) {
          throw new GraphQLError(breakingChanges[0].message, {
            nodes: null,
            source: null,
            positions: null,
            path: null,
            originalError: null,
            extensions: breakingChanges[0].extensions,
          });
        }

        return [];
      },
      validateGraphQlDmlVersion: async (prm, req) => {
        const { space, externalId, version, graphQlDml } =
          req.graphQlDmlVersion;

        const dataModelsStore = CdfDatabaseService.from(
          db,
          'datamodels'
        ).getState();

        const currentSchemaVersion = dataModelsStore.find(
          (item) =>
            // eslint-disable-next-line
            item.externalId === externalId &&
            item.space === space &&
            item.version.toString() === version.toString()
        ) as any;

        if (!currentSchemaVersion) {
          return [];
        }

        const breakingChanges = await validateBreakingChanges(
          graphQlDml,
          currentSchemaVersion.metadata.graphQlDml,
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

        return [];
      },
    },
    Mutation: {
      upsertApis: (_, req) => {
        const solution = {
          id: v4(),
          createdTime: Date.now(),
          ...req.apis[0],
          versions: [],
        };
        store.insert(solution);
        return [solution];
      },
      deleteApis: (_, req) => {
        const solutionExternalId = req.externalIds[0];

        const solution = store.find({ externalId: solutionExternalId });
        store.deleteByKey({ externalId: solutionExternalId });

        // temp hack for mock server not deleting models (removeById seems not to be working)
        const doesSolutionStillExist = store.find({
          externalId: solutionExternalId,
        })
          ? true
          : false;
        if (doesSolutionStillExist) {
          const state = db.getState();
          state.schema = state.schema.filter(
            (schemaObj) => schemaObj.externalId !== solutionExternalId
          );
          state.spaces = state.spaces.filter(
            (spaceObj) => spaceObj.externalId !== solutionExternalId
          );
          db.setState(state);
          db.write();
        }

        return [solution];
      },
      upsertApiVersionFromGraphQl: async (_, req) => {
        // console.log(req);
        const { apiExternalId, graphQl, bindings } = req.apiVersion;
        const conflictMode = req.conflictMode;
        const version = req.apiVersion.version || 1;

        const schemaVersion = {
          id: v4(),
          createdTime: Date.now(),
          version,
          bindings: bindings,
          dataModel: {
            graphqlRepresentation: graphQl,
            types: [],
          },
        };

        const solution = store.find({ externalId: apiExternalId });
        const versions = (solution.versions || []) as CdfResourceObject[];

        const currentSchemaVersion = versions.find(
          (schemaVersion: any) => schemaVersion.version === version
        ) as any;

        if (conflictMode !== 'NEW_VERSION' && currentSchemaVersion) {
          const breakingChanges = await validateBreakingChanges(
            graphQl,
            currentSchemaVersion.dataModel.graphqlRepresentation,
            'upsertApiVersionFromGraphQl'
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

        if (conflictMode === 'NEW_VERSION') {
          versions.push(schemaVersion);
        } else if (currentSchemaVersion) {
          const currentSchemaVersionIdx = versions.findIndex(
            (schemaVersion: any) => schemaVersion.version === version
          ) as number;
          currentSchemaVersion.dataModel.graphqlRepresentation = graphQl;
          currentSchemaVersion.bindings = bindings;
          versions[currentSchemaVersionIdx] = currentSchemaVersion;
          solution.versions = versions;
        }

        store.updateBy({ externalId: apiExternalId }, solution);

        const serverKey = createMockServerKey(solution.externalId, version);

        graphQlServers[serverKey] = buildMockServer({
          db,
          mockDb: solution.db as any,
          externalId: solution.externalId as string,
          schema: graphQl,
          version: version,
          updateBindings: true,
          bindings,
        });

        return schemaVersion;
        // throw new Error()
      },
      upsertGraphQlDmlVersion: async (_, req) => {
        const dataModelsStore = CdfDatabaseService.from(db, 'datamodels');
        const { space, externalId, version, name, description, graphQlDml } =
          req.graphQlDmlVersion;

        // not available in the specs, will be added later?
        let conflictMode = req.conflictMode || 'NEW_VERSION';
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

        if (
          dbDataModelVersion &&
          !dbDataModelVersion.metadata.graphQlDml &&
          conflictMode === 'NEW_VERSION'
        ) {
          conflictMode = 'PATCH';
        }

        if (
          conflictMode !== 'NEW_VERSION' &&
          dbDataModelVersion &&
          dbDataModelVersion.metadata.graphQlDml
        ) {
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

        if (conflictMode === 'NEW_VERSION') {
          dataModelsStore.insert(dataModelVersion);
        } else if (dataModelVersion) {
          dataModelVersion.lastUpdatedTime = Date.now();
          dataModelVersion.metadata.graphQlDml = graphQlDml;

          dataModelsStore.updateBy(
            { id: dbDataModelVersion.id },
            dataModelVersion
          );
        }

        if (graphQlDml) {
          graphQlServers[serverKey] = buildMockServer(
            {
              db,
              mockDb: CdfDatabaseService.from(
                db,
                'instances'
              ).getState() as any,
              externalId,
              schema: graphQlDml,
              version: dataModelVersion.version,
              updateBindings: true,
              space: dataModelVersion.space,
            },
            true
          );
        }

        return { result: { ...dataModelVersion, graphQlDml }, errors: [] };
      },
    },
  };
};
