import { CdfMockDatabase } from '../../../../types';
import {
  longScalar,
  timestampScalar,
} from '../../../../utils/graphql/custom-scalars';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { fetchAndQueryData } from '../../utils/query-fetcher';
import { objToFilter } from '../../../../utils';
import { v4 } from 'uuid';
import { CdfResourceObject } from 'apps/mock-server/src/app';

export const graphQlMetaApiResolvers = (db: CdfMockDatabase) => {
  const store = CdfDatabaseService.from(db, 'schema');

  return {
    Timestamp: timestampScalar,
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
        return [solution];
      },
      upsertApiVersionFromGraphQl: (_, req) => {
        const { apiExternalId, graphQl, bindings } = req.apiVersion;
        const conflictMode = req.conflictMode;
        const version = req.version || 1;
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
        console.log(solution);
        const versions = (solution.versions || []) as CdfResourceObject[];
        versions.push(schemaVersion);
        solution.versions = versions;
        store.updateBy({ externalId: apiExternalId }, solution);

        //first insert the version
        //create the graphql server
        //return the created version

        console.log('upsertApiVersionFromGraphQl', _, req, solution);
        return schemaVersion;
      },
    },
    // root: (ref) => {
    //   return findAssetRoot(ref.parentExternalId, db);
    // },
    // parent: (ref) => {
    //   return findAssetParent(ref.parentExternalId, db);
    // },
    // metadata: (ref) => {
    //   return Object.keys(ref.metadata).map((key) => ({
    //     key,
    //     value: ref.metadata[key],
    //   }));
    // },
  };
};
