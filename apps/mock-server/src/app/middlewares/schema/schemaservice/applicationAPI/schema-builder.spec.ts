import { SchemaServiceGraphqlApiBuilder } from './schema-builder';
import { GraphQlSchemaParser } from '../../../../common/graphql-schema-parser';
import { execSchemaMock } from '../../../../../tests/mocks';

describe('SchemaServiceGraphqlApiBuilder Test', () => {
  const normalizeString = (input: string) =>
    input.replace(/\\n/gm, '').replace(/\\t/gm, '').replace(/\s/gm, '');

  it('Should create instance', () => {
    const service = new SchemaServiceGraphqlApiBuilder();
    expect(service).toBeTruthy();
  });

  it('Should build executable schema', () => {
    const schemaBuilder = new SchemaServiceGraphqlApiBuilder();
    const parser = new GraphQlSchemaParser();
    const schema =
      'type Post @view {\n  title: String!\n  views: Int!\n  user: User\n comments: [Comment]}\n\ntype User @view {\n  name: String!\n}\n\ntype Comment @view {\n  body: String!\n  date: Timestamp!\n  post: Post\n}\n';
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

    // console.log(graphQlSchema);
    expect(normalizeString(graphQlSchema)).toEqual(
      normalizeString(execSchemaMock)
    );
  });
});
