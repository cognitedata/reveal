import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  KeyValuePair,
  CdfMockDatabase,
  TemplateGroupTemplate,
} from '../../../../types';
import { CdfDatabaseService } from '../../../../common/cdf-database.service';
import { GraphQlSchemaParser } from '../../../../common/graphql-schema-parser';
import uuid from '../../../../utils/uuid';
import { schemaServiceGraphqlApi } from '../../config/schema-service-api';
import { Api, DmsBinding } from '../../types';
import { buildQueryResolvers } from './query-resolvers-builder';
import { SchemaServiceGraphqlApiBuilder } from './schema-builder';
import { createMockServerKey } from '../../utils/graphql-server-utils';

export interface BuildMockServerParams {
  db: CdfMockDatabase;
  mockDb?: KeyValuePair;
  schema: string;
  version: number;
  externalId: string;
  updateBindings: boolean;
  bindings?: DmsBinding[];
}
export const buildMockServer = (params: BuildMockServerParams) => {
  const { db, schema, version, externalId, updateBindings, bindings } = params;
  const parser = new GraphQlSchemaParser();
  const schemaBuilder = new SchemaServiceGraphqlApiBuilder();

  const store = CdfDatabaseService.from(db, 'schema');

  const templateTables = parser.getTableNames(schema, 'view');
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
  const templateDb = template.db || {};

  // if (!template) {
  //   template = store.insert({
  //     id: uuid.generate(),
  //     version,
  //     schema,
  //     createdTime: Date.now(),
  //     lastUpdatedTime: Date.now(),
  //     templategroups_id,
  //   });
  // }

  if (
    updateBindings ||
    template.db === undefined ||
    !Object.keys(template.db)
  ) {
    templateTables.forEach((table) => {
      let storageTableName = table;
      if (
        bindings &&
        bindings.find((bindingsItem) => bindingsItem.targetName === table)
      ) {
        storageTableName = bindings.find(
          (bindingsItem) => bindingsItem.targetName === table
        )!.dataModelStorageSource.externalId;
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

  const resolvers = buildQueryResolvers({
    db,
    externalId,
    version,
    parsedSchema,
    tablesList: templateTables,
  });

  const executableSchema = makeExecutableSchema({
    typeDefs: graphQlSchema,
    resolvers,
  });

  return executableSchema;
};

export const buildFromMockDb = (db: CdfMockDatabase) => {
  const graphQlServers = {};
  const solutionsMock = CdfDatabaseService.from(
    db,
    'schema'
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
