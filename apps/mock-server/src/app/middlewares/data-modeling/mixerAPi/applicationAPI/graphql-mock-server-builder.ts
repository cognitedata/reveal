import { makeExecutableSchema } from '@graphql-tools/schema';
import { KeyValuePair, CdfMockDatabase } from '../../../../types';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { GraphQlSchemaParser } from '../../../../common/graphql-schema-parser';
import { Api, DmsBinding } from '../../types';
import {
  buildQueryResolvers,
  getDataModelStorageExternalId,
} from './query-resolvers-builder';

import { buildDmsV3QueryResolvers } from './dms-v3-query-resolvers-builder';
import { SchemaServiceGraphqlApiBuilder } from './schema-builder';
import { createMockServerKey } from '../../utils/graphql-server-utils';

export interface BuildMockServerParams {
  db: CdfMockDatabase;
  mockDb?: KeyValuePair;
  schema: string;
  space?: string;
  version: number;
  externalId: string;
  updateBindings: boolean;
  bindings?: DmsBinding[];
}
export const buildMockServer = (
  params: BuildMockServerParams,
  useDmsV3 = false
) => {
  const { db, schema, version, externalId, updateBindings, bindings, space } =
    params;
  const parser = new GraphQlSchemaParser();
  const schemaBuilder = new SchemaServiceGraphqlApiBuilder();

  const storeKey = useDmsV3 ? 'instances' : 'schema';

  const store = CdfDatabaseService.from(db, storeKey);

  const templateTables = parser.getTableNames(schema, '');
  const modifiedSchema = schemaBuilder.sanitizeSchema(schema);

  const parsedSchema = parser.buildGraphQlSchema(
    `
    ${schemaBuilder.getBuiltInTypes()}
    ${modifiedSchema}
    `
  );

  const graphQlSchema = schemaBuilder.buildSchema(
    modifiedSchema,
    parsedSchema,
    templateTables
  );

  const template = store.find({
    externalId,
  });

  if (
    !useDmsV3 &&
    template &&
    (updateBindings || template.db === undefined || !Object.keys(template.db))
  ) {
    const templateDb = template.db || {};
    templateTables.forEach((table) => {
      let storageTableName = table;
      if (
        bindings &&
        bindings.find((bindingsItem) => bindingsItem.targetName === table)
      ) {
        storageTableName = getDataModelStorageExternalId(
          bindings.find((bindingsItem) => bindingsItem.targetName === table)
        );
      }

      if (!templateDb[storageTableName]) {
        templateDb[storageTableName] = [];
      }
    });
    template.db = templateDb;
    store.updateBy(
      {
        externalId,
      },
      template
    );
  }

  const executableSchema = makeExecutableSchema({
    typeDefs: graphQlSchema,
    resolvers: useDmsV3
      ? buildDmsV3QueryResolvers({
          db,
          space,
          externalId,
          version,
          parsedSchema,
          tablesList: templateTables,
        })
      : buildQueryResolvers({
          db,
          externalId,
          version,
          parsedSchema,
          tablesList: templateTables,
        }),
  });

  return executableSchema;
};

export const buildFromMockDb = (db: CdfMockDatabase) => {
  const graphQlServers = {};
  const storeKey = 'schema';
  const solutionsMock = CdfDatabaseService.from(
    db,
    storeKey
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).getState() as any as Api[];
  if (solutionsMock?.length) {
    solutionsMock.forEach((solution) => {
      solution.versions.forEach((solutionVersion) => {
        if (
          !solutionVersion.version ||
          !solutionVersion.dataModel.graphqlRepresentation
        ) {
          console.warn(
            `Missing version or graphqlRepresentation. Can not create graphql mock for ${JSON.stringify(
              solutionVersion,
              null,
              2
            )}`
          );
        } else {
          const serverKey = createMockServerKey(
            solution.externalId,
            solutionVersion.version
          );

          graphQlServers[serverKey] = buildMockServer({
            db,
            mockDb: solution.db,
            externalId: solution.externalId as string,
            schema: solutionVersion.dataModel.graphqlRepresentation,
            version: solutionVersion.version,
            updateBindings: false,
          });
        }
      });
    });
  }

  return graphQlServers;
};

// DMS V3 Compatible Servers
export const buildMixerApiGraphQlServersFromMockDb = (db: CdfMockDatabase) => {
  const graphQlServers = {};
  const storeKey = 'datamodels';
  const dataModelsMock = CdfDatabaseService.from(
    db,
    storeKey
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).getState() as any[];
  if (dataModelsMock?.length) {
    dataModelsMock.forEach((dataModelVersion) => {
      if (!dataModelVersion.version || !dataModelVersion.metadata.graphQlDml) {
        console.warn(
          `Missing version or graphqlRepresentation. Can not create graphql mock for ${JSON.stringify(
            dataModelVersion,
            null,
            2
          )}`
        );
      } else {
        const serverKey = createMockServerKey(
          `${dataModelVersion.space}_${dataModelVersion.externalId}`,
          dataModelVersion.version
        );

        graphQlServers[serverKey] = buildMockServer(
          {
            db,
            mockDb: dataModelVersion.db,
            space: dataModelVersion.space,
            externalId: dataModelVersion.externalId as string,
            schema: dataModelVersion.metadata.graphQlDml,
            version: dataModelVersion.version,
            updateBindings: false,
          },
          true
        );
      }
    });
  }

  return graphQlServers;
};
