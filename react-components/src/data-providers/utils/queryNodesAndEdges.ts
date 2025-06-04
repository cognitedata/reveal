import type {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  CogniteClient,
  QueryRequest,
  QueryNodeTableExpressionV3,
  QueryEdgeTableExpressionV3
} from '@cognite/sdk';

// This function should be removed once the SDK is updated to include the function
export async function queryNodesAndEdges<
  TQueryRequest extends QueryRequest,
  TypedSelectSources extends SelectSourceWithParams = SelectSourceWithParams
>(
  query: TQueryRequest,
  sdk: CogniteClient
): Promise<QueryResult<TQueryRequest, TypedSelectSources>> {
  const response = await sdk.instances.query(query);
  return response as QueryResult<TQueryRequest, TypedSelectSources>;
}

type SELECT = 'select';
type WITH = 'with';
type PROPERTIES = 'properties';
type SOURCES = 'sources';
type SOURCE = 'source';
type SPACE = 'space';
type EXTERNALID = 'externalId';
type VERSION = 'version';
type ALLPROPERTIES = '*';

export type InstanceType<
  TQueryRequest extends QueryRequest,
  SelectKey extends keyof TQueryRequest[SELECT]
> = TQueryRequest[WITH][SelectKey] extends QueryNodeTableExpressionV3
  ? Omit<NodeDefinition, PROPERTIES>
  : TQueryRequest[WITH][SelectKey] extends QueryEdgeTableExpressionV3
    ? Omit<EdgeDefinition, PROPERTIES>
    : Omit<NodeOrEdge, PROPERTIES>;

export type TypedSourceProperty<
  SelectSource extends NonNullable<
    QueryRequest[SELECT][keyof QueryRequest[SELECT]][SOURCES]
  >[number],
  TypedSelectSourcePropertyMap extends SelectSourceWithParams = SelectSourceWithParams
> = Extract<TypedSelectSourcePropertyMap[number], Pick<SelectSource, SOURCE>>[PROPERTIES];

export type SelectSourceWithParams = Array<{
  source: {
    type: string;
    space: string;
    externalId: string;
    version: string;
  };
  properties: Record<string, unknown>;
}>;

export type QueryResult<
  TQueryRequest extends QueryRequest,
  TSelectSourceWithParams extends SelectSourceWithParams = SelectSourceWithParams
> = {
  items: {
    [SELECT_KEY in keyof TQueryRequest[SELECT]]: Array<
      InstanceType<TQueryRequest, SELECT_KEY> & {
        properties: {
          [SELECT_SOURCE in NonNullable<
            TQueryRequest[SELECT][SELECT_KEY][SOURCES]
          >[number] as SELECT_SOURCE[SOURCE][SPACE]]: {
            [SELECT_SOURCE_VAR in SELECT_SOURCE as `${SELECT_SOURCE_VAR[SOURCE][EXTERNALID]}/${SELECT_SOURCE_VAR[SOURCE][VERSION]}`]: SELECT_SOURCE_VAR[PROPERTIES][0] extends ALLPROPERTIES
              ? Record<string, unknown>
              : {
                  [SELECT_SOURCE_PROPERTY in SELECT_SOURCE_VAR[PROPERTIES][number]]: TypedSourceProperty<
                    SELECT_SOURCE_VAR,
                    TSelectSourceWithParams
                  >[SELECT_SOURCE_PROPERTY] extends never
                    ? unknown
                    : TypedSourceProperty<
                        SELECT_SOURCE_VAR,
                        TSelectSourceWithParams
                      >[SELECT_SOURCE_PROPERTY];
                };
          };
        };
      }
    >;
  };
  nextCursor?: {
    [SELECT_SOURCE_KEY in keyof TQueryRequest[SELECT]]: string;
  };
};
