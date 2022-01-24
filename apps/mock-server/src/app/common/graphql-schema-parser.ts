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
    const schema = buildSchema(newSchemaString, {
      experimentalFragmentVariables: true,
    });

    const introspection = graphqlSync(schema, getIntrospectionQuery())
      .data as IntrospectionQuery;

    return introspection;
  }

  getTableNames(schemaString: string): string[] {
    let m;
    const regex = /type[\s]{1,}[a-zA-Z]{1,20}[\s]{1,}@template[\s]{1,}\{/gm;

    const templateTables = [];

    while ((m = regex.exec(schemaString)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        templateTables.push(
          (match as string)
            .replace('type', '')
            .replace('@template', '')
            .replace('{', '')
            .trim()
        );
      });
    }

    return templateTables;
  }

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
}
