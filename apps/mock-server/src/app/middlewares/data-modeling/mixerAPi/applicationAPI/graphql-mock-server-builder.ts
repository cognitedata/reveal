import { makeExecutableSchema } from '@graphql-tools/schema';

import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { GraphQlSchemaParser } from '../../../../common/graphql-schema-parser';
import { KeyValuePair, CdfMockDatabase } from '../../../../types';
import { createMockServerKey } from '../../utils/graphql-server-utils';

import { buildDmsV3QueryResolvers } from './dms-v3-query-resolvers-builder';
import { SchemaServiceGraphqlApiBuilder } from './schema-builder';

export interface BuildMockServerParams {
  db: CdfMockDatabase;
  mockDb?: KeyValuePair;
  schema: string;
  space?: string;
  version: number;
  externalId: string;
}
export const buildMockServer = (params: BuildMockServerParams) => {
  const { db, schema, version, externalId, space } = params;
  const parser = new GraphQlSchemaParser();
  const schemaBuilder = new SchemaServiceGraphqlApiBuilder();

  const templateTables = parser.getTableNames(schema, '');

  const parsedSchema = parser.buildGraphQlSchema(
    `
    ${schemaBuilder.getBuiltInTypes()}
    ${schema}
    `
  );

  const graphQlSchema = schemaBuilder.buildSchema(
    schema,
    parsedSchema,
    templateTables
  );

  const executableSchema = makeExecutableSchema({
    typeDefs: graphQlSchema,
    resolvers: buildDmsV3QueryResolvers({
      db,
      space,
      externalId,
      version,
      parsedSchema,
      tablesList: templateTables,
    }),
  });

  return executableSchema;
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
      if (
        !dataModelVersion.version ||
        (!dataModelVersion.metadata.graphQlDml &&
          dataModelVersion.metadata.graphQlDml !== null)
      ) {
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

        graphQlServers[serverKey] = buildMockServer({
          db,
          mockDb: dataModelVersion.db,
          space: dataModelVersion.space,
          externalId: dataModelVersion.externalId as string,
          schema: dataModelVersion.metadata.graphQlDml,
          version: dataModelVersion.version,
        });
      }
    });
  }

  return graphQlServers;
};
