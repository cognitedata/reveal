/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk';
import { type FdmPropertyType } from '../components/Reveal3DResources/types';

type InstanceType = 'node' | 'edge';
type EdgeDirection = 'source' | 'destination';

type InstanceFilter = any;
type ViewPropertyReference = any;

export type ExternalId = string;
export type Space = string;

export type Item = {
  instanceType: InstanceType;
} & DmsUniqueIdentifier;

export type Source = {
  type: 'view';
} & SimpleSource;

export type SimpleSource = {
  version: string;
} & DmsUniqueIdentifier;

export type DmsUniqueIdentifier = {
  space: Space;
  externalId: ExternalId;
};

export type ViewQueryFilter = {
  view: Source;
};

export type ResultSetExpression = (NodeResultSetExpression | EdgeResultSetExpression) & {
  limit?: number;
  sort?: any[];
};

export type NodeResultSetExpression = {
  nodes: {
    filter?: InstanceFilter;
    from?: string;
    through?: ViewPropertyReference;
    chainTo?: EdgeDirection;
    direction?: 'outwards' | 'inwards';
  };
};

export type EdgeResultSetExpression = {
  edges: {
    filter?: InstanceFilter;
    chainTo?: EdgeDirection;
    from?: string;
    nodeFilter?: InstanceFilter;
    terminationFilter?: InstanceFilter;
    maxDistance?: number;
    direction?: 'outwards' | 'inwards';
    limitEach?: number;
  };
};

type SourceProperties = {
  source: Source;
  properties: readonly string[];
};

export type Query = {
  with: Record<string, ResultSetExpression>;
  select: Record<string, QuerySelect>;
  parameters?: Record<string, string | number>;
  cursors?: Record<string, string>;
};

type QuerySelect = {
  sources?: readonly SourceProperties[];
};

export type EdgeItem<EdgeProperties = Record<string, unknown>> = {
  instanceType: string;
  version: number;
  type: DmsUniqueIdentifier;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  startNode: DmsUniqueIdentifier;
  endNode: DmsUniqueIdentifier;
  properties: EdgeProperties;
};

export type NodeItem<PropertyType = Record<string, unknown>> = {
  instanceType: InstanceType;
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  deletedTime: number;
  properties: FdmPropertyType<PropertyType>;
};

type InspectionOperations =
  | { involvedContainers: Record<never, never>; involvedViews?: Record<never, never> }
  | { involvedContainers?: Record<never, never>; involvedViews: Record<never, never> };

export type InspectFilter = {
  inspectionOperations: InspectionOperations;
  items: Array<{ instanceType: InstanceType; externalId: string; space: string }>;
};

export type InspectResult = {
  involvedContainers: Array<{
    type: 'container';
    space: string;
    externalId: string;
  }>;
  involvedViews: Source[];
};

export type InspectResultList = {
  items: Array<{
    instanceType: InstanceType;
    externalId: string;
    space: string;
    inspectionResults: InspectResult;
  }>;
};

type SelectKey<T extends Query> = keyof T['select'];

export type QueryResult<T extends Query> = {
  items: Record<SelectKey<T>, NodeItem[] | EdgeItem[]>;
  nextCursor: Record<SelectKey<T>, string> | undefined;
};

export type ExternalIdsResultList<PropertyType> = {
  items: Array<NodeItem<PropertyType>>;
  typing?: Record<
    string,
    Record<
      string,
      Record<
        string,
        {
          nullable?: boolean;
          autoIncrement?: boolean;
          defaultValue?: any;
          description?: string;
          name?: string;
          type: { type: string };
        }
      >
    >
  >;
};

export type ViewItem = {
  externalId: string;
  space: string;
  version: string;
  createdTime: number;
  lastUpdatedTime: number;
  writable: boolean;
  usedFor: string;
  isGlobal: boolean;
  properties: Record<string, Record<string, any>>;
  name: string;
  implements: Source[];
};

export type DataModelListResponse = {
  items: Array<{ views: Source[] }>;
};

export class FdmSDK {
  private readonly _sdk: CogniteClient;
  private readonly _byIdsEndpoint: string;
  private readonly _listEndpoint: string;
  private readonly _inspectEndpoint: string;
  private readonly _searchEndpoint: string;
  private readonly _queryEndpoint: string;
  private readonly _listViewsEndpoint: string;
  private readonly _viewsByIdEndpoint: string;
  private readonly _listDataModelsEndpoint: string;
  private readonly _createUpdateInstancesEndpoint: string;
  private readonly _deleteInstancesEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    const instancesBaseUrl = `${baseUrl}/api/v1/projects/${project}/models/instances`;
    const viewsBaseUrl = `${baseUrl}/api/v1/projects/${project}/models/views`;

    this._listEndpoint = `${instancesBaseUrl}/list`;
    this._queryEndpoint = `${instancesBaseUrl}/query`;
    this._byIdsEndpoint = `${instancesBaseUrl}/byids`;
    this._inspectEndpoint = `${instancesBaseUrl}/inspect`;
    this._searchEndpoint = `${instancesBaseUrl}/search`;
    this._listDataModelsEndpoint = `${baseUrl}/api/v1/projects/${project}/models/datamodels`;
    this._viewsByIdEndpoint = `${viewsBaseUrl}/byids`;
    this._listViewsEndpoint = viewsBaseUrl;
    this._createUpdateInstancesEndpoint = instancesBaseUrl;
    this._deleteInstancesEndpoint = `${instancesBaseUrl}/delete`;

    this._sdk = sdk;
  }

  public async listViews(
    space: string,
    includeInheritedProperties: boolean = true
  ): Promise<{ views: ViewItem[] }> {
    const result = await this._sdk.get(this._listViewsEndpoint, {
      params: {
        includeInheritedProperties,
        space
      }
    });

    if (result.status === 200) {
      return { views: result.data.items as ViewItem[] };
    }
    throw new Error(`Failed to list views. Status: ${result.status}`);
  }

  // eslint-disable-next-line no-dupe-class-members
  public async searchInstances<
    PropertiesType extends Record<string, unknown> = Record<string, unknown>
  >(
    searchedView: Source,
    query: string,
    instanceType?: InstanceType,
    limit?: number,
    filter?: InstanceFilter,
    properties?: string[]
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async searchInstances<
    PropertiesType extends Record<string, unknown> = Record<string, unknown>
  >(
    searchedView: Source,
    query: string,
    instanceType?: 'edge',
    limit?: number,
    filter?: InstanceFilter,
    properties?: string[]
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async searchInstances<PropertiesType = Record<string, unknown>>(
    searchedView: Source,
    query: string,
    instanceType?: 'node',
    limit?: number,
    filter?: InstanceFilter,
    properties?: string[]
  ): Promise<{ instances: Array<NodeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async searchInstances<
    PropertiesType extends Record<string, unknown> = Record<string, unknown>
  >(
    searchedView: Source,
    query: string,
    instanceType?: InstanceType,
    limit: number = 1000,
    filter?: InstanceFilter,
    properties?: string[]
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }> {
    const data: any = { view: searchedView, query, instanceType, filter, properties, limit };

    const result = await this._sdk.post(this._searchEndpoint, { data });

    if (result.status === 200) {
      hoistInstanceProperties(
        searchedView,
        result.data.items as Array<EdgeItem<PropertiesType>> | Array<NodeItem<PropertiesType>>
      );

      return { instances: result.data.items };
    }
    throw new Error(`Failed to search for instances. Status: ${result.status}`);
  }

  // eslint-disable-next-line no-dupe-class-members
  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<{
    instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>>;
    nextCursor?: string;
  }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: 'node',
    source?: Source,
    cursor?: string
  ): Promise<{ instances: Array<NodeItem<PropertiesType>>; nextCursor?: string }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: 'edge',
    source?: Source,
    cursor?: string
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>>; nextCursor?: string }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: InstanceType,
    source: Source,
    cursor?: string
  ): Promise<{
    instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>>;
    nextCursor?: string;
  }> {
    const data: any = { filter, instanceType };
    if (source !== null) {
      data.sources = [{ source }];
    }
    if (cursor !== undefined) {
      data.cursor = cursor;
    }

    const result = await this._sdk.post(this._listEndpoint, { data });

    if (result.status !== 200) {
      throw new Error(`Failed to fetch instances. Status: ${result.status}`);
    }

    const typedResult = result.data.items as Array<
      EdgeItem<Record<string, any>> | NodeItem<Record<string, any>>
    >;

    hoistInstanceProperties(source, typedResult);

    return {
      instances: result.data.items,
      nextCursor: result.data.nextCursor
    };
  }

  // eslint-disable-next-line no-dupe-class-members
  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: InstanceType,
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: 'edge',
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: 'edge',
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }>;

  // eslint-disable-next-line no-dupe-class-members
  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: InstanceFilter,
    instanceType: InstanceType,
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }> {
    let mappings = await this.filterInstances<PropertiesType>(filter, instanceType, source);

    while (mappings.nextCursor !== undefined) {
      const nextMappings = await this.filterInstances<PropertiesType>(
        filter,
        instanceType,
        source,
        mappings.nextCursor
      );

      mappings = {
        instances: [...mappings.instances, ...nextMappings.instances],
        nextCursor: nextMappings.nextCursor
      };
    }

    return { instances: mappings.instances };
  }

  public async getByExternalIds<PropertyType>(
    queries: Array<{ instanceType: InstanceType; externalId: string; space: string }>,
    source?: Source
  ): Promise<ExternalIdsResultList<PropertyType>> {
    const data: any = { items: queries, includeTyping: true };
    if (source !== null) {
      data.sources = [{ source }];
    }

    const result = await this._sdk.post(this._byIdsEndpoint, { data });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async createInstance<PropertyType>(
    queries: Array<{
      instanceType: InstanceType;
      externalId: string;
      space: string;
      sources: [{ source: Source; properties: any }];
    }>
  ): Promise<ExternalIdsResultList<PropertyType>> {
    const data: any = {
      items: queries,
      autoCreateStartNodes: false,
      autoCreateEndNodes: false,
      skipOnVersionConflict: false,
      replace: false
    };

    const result = await this._sdk.post(this._createUpdateInstancesEndpoint, { data });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`Failed to create instances. Status: ${result.status}`);
  }

  public async deleteInstance<PropertyType>(
    queries: Array<{
      instanceType: InstanceType;
      externalId: string;
      space: string;
    }>
  ): Promise<ExternalIdsResultList<PropertyType>> {
    const data: any = {
      items: queries
    };

    const result = await this._sdk.post(this._deleteInstancesEndpoint, { data });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`Failed to delete instances. Status: ${result.status}`);
  }

  public async inspectInstances(inspectFilter: InspectFilter): Promise<InspectResultList> {
    const result = await this._sdk.post(this._inspectEndpoint, { data: inspectFilter });

    if (result.status === 200) {
      return result.data as InspectResultList;
    }
    throw new Error(`Failed to fetch instances`);
  }

  public async getViewsByIds(views: Source[]): Promise<{ items: ViewItem[] }> {
    const result = await this._sdk.post(this._viewsByIdEndpoint, {
      data: {
        items: views.map((view) => ({
          externalId: view.externalId,
          space: view.space,
          version: view.version
        }))
      }
    });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async queryNodesAndEdges<const T extends Query>(query: T): Promise<QueryResult<T>> {
    const result = await this._sdk.post(this._queryEndpoint, { data: query });
    if (result.status === 200) {
      return { items: result.data.items, nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async listDataModels(): Promise<DataModelListResponse> {
    const result = await this._sdk.get(this._listDataModelsEndpoint, { params: { limit: 1000 } });
    if (result.status === 200) {
      return result.data;
    }
    throw new Error(`Failed to fetch data models. Status: ${result.status}`);
  }
}

function hoistInstanceProperties(
  source: Source,
  instances: Array<EdgeItem<Record<string, any>> | NodeItem<Record<string, any>>>
): void {
  if (source === undefined) {
    return;
  }
  const propertyKey = `${source.externalId}/${source.version}`;
  instances.forEach((instance) => {
    if (instance.properties[source.space][propertyKey] !== undefined) {
      instance.properties = instance.properties[source.space][propertyKey];
    }
  });
}
