import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { camelize } from '../../../utils/text-utils';

export class TemplatesSchemaBuilder {
  sanitizeSchema(sourceSchema: string): string {
    const regexp = new RegExp('@template', 'g');

    const modifiedSchema = (sourceSchema as string)
      .replace(regexp, '')
      .replace(/Long/gim, 'Float');

    return modifiedSchema;
  }

  buildSchema(
    sourceSchema: string,
    parsedSchema: IntrospectionQuery,
    tablesList: string[]
  ): string {
    return `
    ${this.getBuiltInTypes()}
    ${sourceSchema}
    ${this.generateFiltersInputs(tablesList, parsedSchema)}
    ${this.generateTablesPages(tablesList)}
    ${this.generateQueries(tablesList)}
    `;
  }

  getBuiltInTypes() {
    return `

interface Datapoint {
  timestamp: Float!
  value: Float
}

type DatapointString implements Datapoint {
    timestamp: Float!
    value: Float
    stringValue: String
}

type DatapointFloat implements Datapoint {
    timestamp: Float!
    value: Float
}

type DatapointInt {
    timestamp: Float!
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
    id: Float
    name: String
    metadata: [MetadataItem]
    description: String
    externalId: String
    isString: Boolean
    isStep: Boolean
    unit: String
    datapoints(start: Float, end: Float, limit: Int! = 100): [Datapoint]
    aggregatedDatapoints(start: Float, end: Float, limit: Int! = 100, granularity: String!): AggregationResult
    latestDatapoint: Datapoint
}

type SyntheticTimeSeries {
    name: String
    metadata: [MetadataItem]
    description: String
    isStep: Boolean
    unit: String
    datapointsWithGranularity(start: Float, end: Float, limit: Int! = 100, granularity: String): [Datapoint]
    datapoints(start: Float, end: Float, limit: Int! = 100): [Datapoint]
}

type Asset {
    id: Float!
    externalId: String
    name: String!
    description: String
    root: Asset
    parent: Asset
    source: String
    metadata: [MetadataItem]
}

type File {
    id: Float!
    externalId: String
    name: String!
    directory: String
    mimeType: String
    source: String
    metadata: [MetadataItem]
    dataSetId: Float
    assets: [Asset]
    sourceCreatedTime: Float
    sourceModifiedTime: Float
    uploaded: Boolean!
    uploadedTime: Float
    createdTime: Float!
    lastUpdatedTime: Float!
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
          if (field.type.kind === 'SCALAR' && field.type.name === 'String') {
            return `${field.name}: _ConditionalOpString`;
          }
          if (
            field.type.kind === 'SCALAR' &&
            (field.type.name === 'Float' ||
              field.type.name === 'Int' ||
              field.type.name === 'Float')
          ) {
            return `${field.name}: _ConditionalOpNumber`;
          } else if (field.type.kind === 'SCALAR') {
            return `${field.name}: ${field.type.name}`;
          }
          return '';
        })
        .join('\n')}
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
