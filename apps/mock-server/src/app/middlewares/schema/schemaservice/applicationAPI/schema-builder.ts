import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { getType } from '../../../../utils';
import { camelize } from '../../../../utils/text-utils';
import { schemaServiceGraphqlApi } from '../../config/schema-service-api';

export class SchemaServiceGraphqlApiBuilder {
  private typeSearchFieldsMap = {};
  sanitizeSchema(sourceSchema: string): string {
    const regexp = new RegExp('@view', 'g');

    const modifiedSchema = (sourceSchema as string).replace(regexp, '');

    return modifiedSchema;
  }

  buildSchema(
    sourceSchema: string,
    parsedSchema: IntrospectionQuery,
    tablesList: string[]
  ): string {
    this.typeSearchFieldsMap = {};
    const generatedSchema = `
    ${this.getBuiltInTypes()}
    ${this.extendSourceSchema(sourceSchema, parsedSchema, tablesList)}
    ${this.generateFiltersInputs(tablesList, parsedSchema)}
    ${this.generateTypeConnection(tablesList)}
    ${this.generateQueries(tablesList)}
    `;

    return generatedSchema;
  }

  getBuiltInTypes() {
    return `
    scalar JSONObject

    scalar Timestamp

    scalar Int64

    input _StringCondition {
      eq: String
      isNull: Boolean
      in: [String!]
      gt: String
      lt: String
      gte: String
      lte: String
      prefix: String
    }

    input _FloatCondition {
      eq: Float
      isNull: Boolean
      in: [Float!]
      gt: Float
      lt: Float
      gte: Float
      lte: Float
    }

    input _IDCondition {
      eq: ID
      isNull: Boolean
      in: [ID!]
    }

    input _Int64Condition {
      eq: Int64
      isNull: Boolean
      in: [Int64!]
      gt: Int64
      lt: Int64
      gte: Int64
      lte: Int64
    }

    input _IntCondition {
      eq: Int
      isNull: Boolean
      in: [Int!]
      gt: Int
      lt: Int
      gte: Int
      lte: Int
    }

    input _TimestampCondition {
      eq: Timestamp
      isNull: Boolean
      in: [Timestamp!]
      gt: Timestamp
      lt: Timestamp
      gte: Timestamp
      lte: Timestamp
    }

    enum SortDirection {
      ASC
      DESC
    }

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
  }
    `;
  }

  private extendSourceSchema(
    sourceSchema: string,
    parsedSchema: IntrospectionQuery,
    tablesList: string[]
  ): string {
    let extendedSchema = sourceSchema;
    tablesList.forEach((table) => {
      // (
      //   parsedSchema['__schema'].types.find(
      //     (type) => type.name === table
      //   ) as IntrospectionObjectType
      // ).fields.forEach((field) => {
      //   const mutedType = field.type as any;
      //   const fieldSchemaType = mutedType.ofType
      //     ? getType(mutedType.ofType)
      //     : (field.type as any).name;

      //   if (tablesList.includes(fieldSchemaType)) {
      //     const typeDeclarations = `(${fieldSchemaType}|${fieldSchemaType}!|\\[${fieldSchemaType}\\]|\\[${fieldSchemaType}\\]!|\\[${fieldSchemaType}!\\]!|\\[${fieldSchemaType}!\\]!)`;
      //     const regexp = new RegExp(`${field.name}: ${typeDeclarations}`, 'g');

      //     const matches = extendedSchema.match(regexp);

      //     if (matches) {
      //       matches.forEach((match) => {
      //         extendedSchema = extendedSchema.replace(
      //           match,
      //           `${field.name}(filter: _${this.capitalize(
      //             fieldSchemaType
      //           )}Filter): ${match.replace(`${field.name}:`, '')}`
      //         );
      //       });
      //     }
      //   }
      // });

      extendedSchema = extendedSchema.replace(
        new RegExp('type ' + table + '\\s{1,}\\{', 'gmi'),
        `type ${table} {
        externalId: ID!`
      );
    });

    return extendedSchema;
  }
  private generateFiltersInputs(
    tablesList: string[],
    parsedSchema: IntrospectionQuery
  ): string {
    return `
    ${tablesList
      .map((table) => {
        const searchFilter = [];
        const searchFields = [];
        const listFilter = [];
        const sortFields = [];
        (
          parsedSchema['__schema'].types.find(
            (type) => type.name === table
          ) as IntrospectionObjectType
        ).fields.forEach((field) => {
          const mutedKind =
            field.type.kind === 'NON_NULL' ? field.type.ofType : field.type;
          const mutedType = field.type as any;
          const fieldKind = mutedKind.kind;
          const fieldSchemaType = mutedType.ofType
            ? getType(mutedType.ofType)
            : (field.type as any).name;

          if (fieldKind === 'SCALAR') {
            sortFields.push(`${field.name}: SortDirection`);
          }

          if (fieldKind === 'SCALAR' && fieldSchemaType === 'String') {
            searchFilter.push(`${field.name}: _StringCondition`);
            listFilter.push(`${field.name}: _StringCondition`);
            searchFields.push(field.name);
          } else if (
            fieldKind === 'SCALAR' &&
            (fieldSchemaType === 'Float' ||
              fieldSchemaType === 'Int' ||
              fieldSchemaType === 'Int64')
          ) {
            searchFilter.push(`${field.name}: _IntCondition`);
            listFilter.push(`${field.name}: _IntCondition`);
          } else if (fieldKind === 'SCALAR') {
            searchFilter.push(`${field.name}: ${fieldSchemaType}`);
            listFilter.push(`${field.name}: ${fieldSchemaType}`);
          }
        });

        const listFilterName = `_List${this.capitalize(table)}Filter`;
        const searchFilterName = `_Search${this.capitalize(table)}Filter`;

        const searchFieldsEnum = `enum _Search${this.capitalize(table)}Fields {
          ${searchFields.join('\n')}
        }`;

        this.typeSearchFieldsMap[table] = searchFields.length > 0;

        return `
        input ${listFilterName} {
          ${listFilter.join('\n')}
          externalId: _IDCondition
          and: [${listFilterName}!]
          or: [${listFilterName}!]
          not: ${listFilterName}
        }

        ${searchFields.length ? searchFieldsEnum : ''}


        input ${searchFilterName} {
          externalId: _IDCondition
          and: [${searchFilterName}!]
          or: [${searchFilterName}!]
          not: ${searchFilterName}
          ${
            searchFields.length
              ? `fields: [_Search${this.capitalize(table)}Fields!]`
              : ''
          }

          ${searchFilter.join('\n')}
        }

        input _${this.capitalize(table)}Sort {
          externalId: SortDirection
          ${sortFields.join('\n')}
        }

        `;
      })
      .join('\n')}
    `;
  }

  private generateTypeConnection(tablesList: string[]): string {
    return `${tablesList
      .map(
        (table) => `
    type ${this.capitalize(table)}Connection {
      edges: [_${this.capitalize(table)}Edge]!
      items: [${table}]!
      pageInfo: PageInfo!
    }

    type _${this.capitalize(table)}Edge {
      node: ${table}
      cursor: String
    }
    `
      )
      .join('\n')}`;
  }

  private generateQueries(tablesList: string[]): string {
    return `
    type Query {
      ${tablesList
        .map(
          (table) => `list${table}(
          after: String
          filter: _List${this.capitalize(table)}Filter
          first: Int
          sort: [_${this.capitalize(table)}Sort!]
        ): ${this.capitalize(table)}Connection

        search${table}(
          ${
            this.typeSearchFieldsMap[table]
              ? `fields: [_Search${this.capitalize(table)}Fields!]`
              : ''
          }

          filter: _Search${this.capitalize(table)}Filter
          first: Int
          query: String!
        ): ${this.capitalize(table)}Connection

        `
        )
        .join('\n')}
    }

      # we need to tell the server which types represent the root query
      # and root mutation types. We call them RootQuery and RootMutation by convention.
      schema {
        query: Query
      }
    `;
  }

  private capitalize(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
