/*!
 * Copyright 2024 Cognite AS
 */

export type Query = {
  with: Record<string, any>;
  select: Record<string, any>;
  parameters?: Record<string, string | number>;
  cursors?: Record<string, string>;
};

type InstanceResult = {
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
};

type NodeResult = InstanceResult & {
  instanceType: 'node';
};

type EdgeResult = InstanceResult & {
  instanceType: 'edge';
  type: {
    space: string;
    externalId: string;
  };
  startNode: {
    space: string;
    externalId: string;
  };
  endNode: {
    space: string;
    externalId: string;
  };
};

type InstanceType<T extends Query, K extends keyof T['select']> =
  Exclude<keyof T['with'][K], 'limit'> extends 'nodes'
    ? NodeResult
    : Exclude<keyof T['with'][K], 'limit'> extends 'edges'
      ? EdgeResult
      : NodeResult | EdgeResult;

export type SelectSourceWithParams = Array<{
  source: {
    type: string;
    space: string;
    externalId: string;
    version: string;
  };
  properties: Record<string, any>;
}>;

export type QueryResult<
  T extends Query,
  L extends SelectSourceWithParams = SelectSourceWithParams
> = {
  items: {
    [K in keyof T['select']]: Array<
      InstanceType<T, K> & {
        properties: {
          [P in T['select'][K]['sources'][number] as P['source']['space']]: {
            [Q in P as `${Q['source']['externalId']}/${Q['source']['version']}`]: {
              [R in Q['properties'][number]]: Extract<
                L[number],
                Pick<Q, 'source'>
              >['properties'][R] extends never
                ? unknown
                : Extract<L[number], Pick<Q, 'source'>>['properties'][R];
            };
          };
        };
      }
    >;
  };
  nextCursor?: Partial<{
    [K in keyof T['select']]: string;
  }>;
};

export function testFunction<
  T extends Query,
  L extends SelectSourceWithParams = SelectSourceWithParams
>(_: T): QueryResult<T, L> {
  throw new Error('Not implemented');
}
