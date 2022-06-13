import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { getType } from '../../../utils';
import { camelize } from '../../../utils/text-utils';

export class TemplatesSchemaBuilder {
  sanitizeSchema(sourceSchema: string): string {
    const regexp = new RegExp('@template', 'g');

    const modifiedSchema = (sourceSchema as string).replace(regexp, '');

    return modifiedSchema;
  }

  buildSchema(
    sourceSchema: string,
    parsedSchema: IntrospectionQuery,
    tablesList: string[]
  ): string {
    return `
    ${this.getBuiltInTypes()}
    ${this.extendSourceSchema(sourceSchema, parsedSchema, tablesList)}
    ${this.generateFiltersInputs(tablesList, parsedSchema)}
    ${this.generateTablesPages(tablesList)}
    ${this.generateQueries(tablesList)}
    `;
  }

  getBuiltInTypes() {
    return `
scalar Long

interface Datapoint {
  timestamp: Long!
  value: Float
}

type DatapointString implements Datapoint {
    timestamp: Long!
    value: Float
    stringValue: String
}

type DatapointFloat implements Datapoint {
    timestamp: Long!
    value: Float
}

type DatapointInt {
    timestamp: Long!
    value: Int
}

type MetadataItem {
    key: String
    value: String
}

type AggregationResult {
    average: [DatapointFloat]
    max: [DatapointFloat]
    min: [DatapointFloat]
    count: [DatapointInt]
    sum: [DatapointFloat]
    interpolation: [DatapointFloat]
    stepInterpolation: [DatapointFloat]
    continuousVariance: [DatapointFloat]
    discreteVariance: [DatapointFloat]
    totalVariation: [DatapointFloat]
}

type TimeSeries {
    id: Long
    name: String
    metadata: [MetadataItem]
    description: String
    externalId: String
    isString: Boolean
    isStep: Boolean
    unit: String
    datapoints(start: Long, end: Long, limit: Int! = 100): [Datapoint]
    aggregatedDatapoints(start: Long, end: Long, limit: Int! = 100, granularity: String!): AggregationResult
    latestDatapoint: Datapoint
}

type SyntheticTimeSeries {
    name: String
    metadata: [MetadataItem]
    description: String
    isStep: Boolean
    unit: String
    datapointsWithGranularity(start: Long, end: Long, limit: Int! = 100, granularity: String): [Datapoint]
    datapoints(start: Long, end: Long, limit: Int! = 100): [Datapoint]
}

type Asset {
    id: Long!
    externalId: String
    name: String!
    description: String
    root: Asset
    parent: Asset
    source: String
    metadata: [MetadataItem]
}

type File {
    id: Long!
    externalId: String
    name: String!
    directory: String
    mimeType: String
    source: String
    metadata: [MetadataItem]
    dataSetId: Long
    assets: [Asset]
    sourceCreatedTime: Long
    sourceModifiedTime: Long
    uploaded: Boolean!
    uploadedTime: Long
    createdTime: Long!
    lastUpdatedTime: Long!
    downloadUrl: String
}

    input _ConditionalOpString {
      eq: [String!]
      anyOfTerms: [String!]
    }
    input _ConditionalOpIds {
      eq: [String]!
    }
    input _ConditionalOpNumber {
      eq: Float
      lt: Float
      gt: Float
      lte: Float
      gte: Float
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
      (
        parsedSchema['__schema'].types.find(
          (type) => type.name === table
        ) as IntrospectionObjectType
      ).fields.forEach((field) => {
        const mutedType = field.type as any;
        const fieldSchemaType = mutedType.ofType
          ? getType(mutedType.ofType)
          : (field.type as any).name;

        if (tablesList.includes(fieldSchemaType)) {
          const typeDeclarations = `(${fieldSchemaType}|${fieldSchemaType}!|\\[${fieldSchemaType}\\]|\\[${fieldSchemaType}\\]!|\\[${fieldSchemaType}!\\]!|\\[${fieldSchemaType}!\\]!)`;
          const regexp = new RegExp(`${field.name}: ${typeDeclarations}`, 'g');

          const matches = extendedSchema.match(regexp);

          if (matches) {
            matches.forEach((match) => {
              extendedSchema = extendedSchema.replace(
                match,
                `${
                  field.name
                }(_filter: _${fieldSchemaType}Filter): ${match.replace(
                  `${field.name}:`,
                  ''
                )}`
              );
            });
          }
        }
      });
    });

    const types = this.getTypeNames(extendedSchema);
    types.forEach((table) => {
      extendedSchema = extendedSchema.replace(
        new RegExp('type ' + table + '\\s{1,}\\{', 'gmi'),
        `type ${table} {
        _externalId: String
        _dataSetId: Long`
      );
    });

    return extendedSchema;
  }

  private getTypeNames(schemaString: string): string[] {
    let m;
    const regex = /type[\s]{1,}[a-zA-Z]{1,20}[\s]{1,}(@template[\s]{1,})?\{/gm;

    const templateTables = [];

    while ((m = regex.exec(schemaString)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match) => {
        if (match) {
          templateTables.push(
            (match as string)
              .replace('type', '')
              .replace('@template', '')
              .replace('{', '')
              .trim()
          );
        }
      });
    }

    return templateTables;
  }

  private generateFiltersInputs(
    tablesList: string[],
    parsedSchema: IntrospectionQuery
  ): string {
    return `
    ${tablesList
      .map(
        (table) => `input _${table}Filter {
      ${(
        parsedSchema['__schema'].types.find(
          (type) => type.name === table
        ) as IntrospectionObjectType
      ).fields
        .map((field) => {
          const mutedKind =
            field.type.kind === 'NON_NULL' ? field.type.ofType : field.type;
          const mutedType = field.type as any;
          const fieldKind = mutedKind.kind;
          const fieldSchemaType = mutedType.ofType
            ? getType(mutedType.ofType)
            : (field.type as any).name;

          if (fieldKind === 'SCALAR' && fieldSchemaType === 'String') {
            return `${field.name}: _ConditionalOpString`;
          }
          if (
            fieldKind === 'SCALAR' &&
            (fieldSchemaType === 'Float' ||
              fieldSchemaType === 'Int' ||
              fieldSchemaType === 'Long')
          ) {
            return `${field.name}: _ConditionalOpNumber`;
          } else if (fieldKind === 'SCALAR') {
            return `${field.name}: ${fieldSchemaType}`;
          }
          return '';
        })
        .join('\n')}
        _externalId: _ConditionalOpString
        _dataSetId: _ConditionalOpIds
        _or: [_${table}Filter!]
        _and: [_${table}Filter!]
    }`
      )
      .join('\n')}
    `;
  }

  private generateTablesPages(tablesList: string[]): string {
    return `${tablesList
      .map(
        (table) => `
    type _${table}Page {
      items: [${table}]
      nextCursor: String
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
          (table) => `${camelize(table)}Query(
          limit: Int
          cursor: String
          filter: _${table}Filter
        ): _${table}Page`
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
}
