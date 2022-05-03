import { makeExecutableSchema } from '@graphql-tools/schema';
import { CdfMockDatabase, KeyValuePair } from '../../../../types';
import { schemaServiceGraphqlApi } from '../../config/schema-service-api';
import { graphQlMetaApiResolvers } from './graphql-resolvers';

export interface BuildSchemaServiceMetaApiMockServerProps {
  db: CdfMockDatabase;
  mockDb?: KeyValuePair;
}
export const buildSchemaServiceMetaApiMockServer = (
  props: BuildSchemaServiceMetaApiMockServerProps
) => {
  const graphQlSchema = schemaServiceGraphqlApi;
  const resolvers = graphQlMetaApiResolvers(props.db);

  const executableSchema = makeExecutableSchema({
    typeDefs: graphQlSchema,
    resolvers,
  });

  return executableSchema;
};
