import {
  graphqlSync,
  getIntrospectionQuery,
  IntrospectionQuery,
  buildSchema,
} from 'graphql';

export class GraphQlSchemaParser {
  buildGraphQlSchema(schemaString: string) {
    const newSchemaString = `${schemaString}
    type Query {
      test: String
    }
    `;

    // schema is your GraphQL schema.
    const schema = buildSchema(newSchemaString);

    const introspection = graphqlSync({
      schema,
      source: getIntrospectionQuery(),
    }).data;

    return introspection as unknown as IntrospectionQuery;
  }

  buildGraphQlSchemaAst(schemaString: string) {
    const newSchemaString = `${schemaString}
    type Query {
      test: String
    }
    `;

    // schema is your GraphQL schema.
    const schema = buildSchema(newSchemaString);

    return schema;
  }

  getTableNames(
    schemaString: string,
    tableDirectiveName = 'template'
  ): string[] {
    let m;
    const regexTemplates =
      /type[\s]{1,}[a-zA-Z]{1,20}[\s]{1,}@template[\s]{1,}\{/gm;
    const regexSchema = /(type|interface)\s\w+/gm;
    const regex =
      tableDirectiveName === 'template' ? regexTemplates : regexSchema;

    const templateTables = [];

    while ((m = regex.exec(schemaString)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match) => {
        templateTables.push(
          (match as string)
            .replace('type', '')
            .replace('interface', '')
            .replace('@' + tableDirectiveName, '')
            .replace('{', '')
            .trim()
        );
      });
    }

    return templateTables.filter((tableName) => tableName);
  }

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
}
