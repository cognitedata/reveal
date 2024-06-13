/*!
 * Copyright 2024 Cognite AS
 */

import { describe, test } from 'vitest';
import { type testFunction, type Query } from './queryNodesEdges.types';

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

describe('queryNodesEdges type tests', () => {
  test('query result keys should match const query select keys', () => {
    type QueryResultSelectKeys = keyof ReturnType<typeof testFunction<typeof testQuery>>['items'];
    type _ = Expect<Equal<QueryResultSelectKeys, keyof typeof testQuery.select>>;
  });

  test('Each source with unique space should map to a key in properties of result', () => {
    type ResultSourceSpaces = keyof ReturnType<
      typeof testFunction<typeof testQuery>
    >['items']['resultExpressionA'][number]['properties'];

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];
    type _ = Expect<Equal<ResultSourceSpaces, QueryResultSpaces>>;
  });

  test('property keys of result should match property keys of sources', () => {
    type ResultPropertiesA = keyof ReturnType<
      typeof testFunction<typeof testQuery>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];
    type QueryPropertiesA =
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number];

    type _0 = Expect<Equal<ResultPropertiesA, QueryPropertiesA>>;

    type ResultPropertiesB = keyof ReturnType<
      typeof testFunction<typeof testQuery>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdB/v1'];
    type QueryPropertiesB =
      (typeof testQuery.select.resultExpressionA.sources)[1]['properties'][number];

    type _1 = Expect<Equal<ResultPropertiesB, QueryPropertiesB>>;

    type ResultPropertiesC = keyof ReturnType<
      typeof testFunction<typeof testQuery>
    >['items']['resultExpressionA'][number]['properties']['spaceB']['externalIdC/v1'];
    type QueryPropertiesC =
      (typeof testQuery.select.resultExpressionA.sources)[2]['properties'][number];

    type _2 = Expect<Equal<ResultPropertiesC, QueryPropertiesC>>;
  });

  test('passing a typed Source generic should return a typed results for parameters', () => {
    type SourceExternalIdAPropertyTypes = [
      {
        source: {
          type: 'view';
          space: 'spaceA';
          externalId: 'externalIdA';
          version: 'v1';
        };
        properties: {
          aPropOne: string;
          aPropTwo: number;
          aPropThree: { externalId: string; space: string };
        };
      }
    ];

    type TypedResultProperties = ReturnType<
      typeof testFunction<typeof testQuery, SourceExternalIdAPropertyTypes>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];

    type _ = Expect<Equal<TypedResultProperties, SourceExternalIdAPropertyTypes[0]['properties']>>;
  });

  test('Passing a non-constant query should be valid', () => {
    type QueryResult = ReturnType<typeof testFunction<Query>>;

    type TestType = QueryResult extends {
      items: Record<string, any>;
      nextCursors?: Record<string, any>;
    }
      ? true
      : false;

    type _ = Expect<Equal<TestType, true>>;
  });

  test('passing * as property should type properties as Record', () => {
    type ResultSourceSpaces = ReturnType<
      typeof testFunction<typeof testQuery>
    >['items']['resultExpressionB'][number]['properties']['spaceD']['externalIdD/v1'];

    // @ts-expect-error - property key should not be the string '*'
    type _ = Expect<Equal<ResultSourceSpaces, '*'>>;

    type _1 = Expect<Equal<ResultSourceSpaces, Record<string, unknown>>>;
  });
});

const testQuery = {
  with: {
    resultExpressionA: {
      nodes: {}
    },
    resultExpressionB: {
      nodes: {}
    },
    resultExpressionC: {
      edges: {}
    }
  },
  select: {
    resultExpressionA: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdA',
            version: 'v1'
          },
          properties: ['aPropOne', 'aPropTwo', 'aPropThree']
        },
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdB',
            version: 'v1'
          },
          properties: ['bPropOne', 'bPropTwo']
        },
        {
          source: {
            type: 'view',
            space: 'spaceB',
            externalId: 'externalIdC',
            version: 'v1'
          },
          properties: ['cPropOne']
        }
      ]
    },
    resultExpressionB: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceD',
            externalId: 'externalIdD',
            version: 'v1'
          },
          properties: ['*']
        }
      ]
    },
    resultExpressionC: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceE',
            externalId: 'externalIdE',
            version: 'v1'
          },
          properties: ['ePropOne', 'ePropTwo']
        }
      ]
    }
  }
} as const satisfies Query;
