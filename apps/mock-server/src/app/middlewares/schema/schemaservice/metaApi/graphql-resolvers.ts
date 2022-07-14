import { CdfMockDatabase, CdfResourceObject } from '../../../../types';
import {
  bigIntScalar,
  timestampStringScalar,
} from '../../../../utils/graphql/custom-scalars';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { fetchAndQueryData } from '../../utils/query-fetcher';
import { objToFilter } from '../../../../utils';
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
        const versions = (solution.versions || []) as CdfResourceObject[];

        const currentSchemaVersion = versions.find(
          (schemaVersion: any) => schemaVersion.version === version
        ) as any;

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
    },
  };
};
