import { makeExecutableSchema } from '@graphql-tools/schema';
import { KeyValuePair } from '../../..';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { GraphQlSchemaParser } from '../../../common/graphql-schema-parser';
import { CdfMockDatabase, TemplateGroupTemplate } from '../../../types';
import uuid from '../../../utils/uuid';
import { buildQueryResolvers } from './query-resolvers-builder';
import { TemplatesSchemaBuilder } from './schema-builder';

export interface BuildMockServerParams {
  db: CdfMockDatabase;
  mockDb?: KeyValuePair;
  schema: string;
  version: number;
  templategroups_id: string;
  incrementVersion: boolean;
}
export const buildMockServer = (params: BuildMockServerParams) => {
  const { db, schema, version, templategroups_id, incrementVersion } = params;
  const parser = new GraphQlSchemaParser();
  const schemaBuilder = new TemplatesSchemaBuilder();

  const store = CdfDatabaseService.from(db, 'templates');
  const templateDb = {};

  const templateTables = parser.getTableNames(schema);
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

  let template = store.find({
    templategroups_id,
    version: incrementVersion && version !== 1 ? +version + 1 : version,
  });

  if (!template) {
    template = store.insert({
      id: uuid.generate(),
      version,
      schema,
      createdTime: Date.now(),
      lastUpdatedTime: Date.now(),
      templategroups_id,
    });
  }

  if (template.db === undefined || !Object.keys(template.db)) {
    templateTables.forEach((table) => {
      templateDb[table] = [];
    });
    template.db = templateDb;
  }

  store.updateBy(
    {
      templategroups_id,
      version: version,
    },
    template
  );

  const resolvers = buildQueryResolvers({
    db,
    templategroups_id,
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
  const templatesMock = CdfDatabaseService.from(
    db,
    'templates'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).getState() as any as TemplateGroupTemplate[];
  if (templatesMock.length) {
    templatesMock.forEach((template) => {
      if (
        !template.version ||
        !template.templategroups_id ||
        !template.schema
      ) {
        console.warn(
          `Missing version, schema or templategroups_id. Can not create graphql mock for ${JSON.stringify(
            template,
            null,
            2
          )}`
        );
      } else {
        const serverKey = createMockServerKey(
          template.templategroups_id,
          template.version
        );
        graphQlServers[serverKey] = buildMockServer({
          db,
          mockDb: template.db,
          templategroups_id: template.templategroups_id as string,
          schema: template.schema,
          version: template.version,
          incrementVersion: false,
        });
      }
    });
  }

  return graphQlServers;
};

export function createMockServerKey(name, version) {
  return `${name}_${version}`;
}
