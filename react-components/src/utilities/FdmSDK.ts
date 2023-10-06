/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk';
import { type FdmPropertyType } from '../components/Reveal3DResources/types';

type InstanceType = 'node' | 'edge';

export type Item = {
  instanceType: InstanceType;
} & DmsUniqueIdentifier;

export type Source = {
  type: 'view';
  version: string;
} & DmsUniqueIdentifier;

export type DmsUniqueIdentifier = {
  space: string;
  externalId: string;
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

export type InspectFilter = {
  inspectionOperations: { involvedViewsAndContainers: Record<never, never> };
  items: Array<{ instanceType: InstanceType; externalId: string; space: string }>;
};

export type InspectResult = {
  involvedViewsAndContainers: {
    containers: Array<{
      type: 'container';
      space: string;
      externalId: string;
    }>;
    views: Source[];
  };
};

export type InspectResultList = {
  items: Array<{
    instanceType: InstanceType;
    externalId: string;
    space: string;
    inspectionResults: InspectResult;
  }>;
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

export class FdmSDK {
  private readonly _sdk: CogniteClient;
  private readonly _byIdsEndpoint: string;
  private readonly _listEndpoint: string;
  private readonly _inspectEndpoint: string;
  private readonly _searchEndpoint: string;
  private readonly _listViewsEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    const instancesBaseUrl = `${baseUrl}/api/v1/projects/${project}/models/instances`;
    const viewsBaseUrl = `${baseUrl}/api/v1/projects/${project}/models/views`;

    this._listEndpoint = `${instancesBaseUrl}/list`;
    this._byIdsEndpoint = `${instancesBaseUrl}/byids`;
    this._inspectEndpoint = `${instancesBaseUrl}/inspect`;
    this._searchEndpoint = `${instancesBaseUrl}/search`;
    this._listViewsEndpoint = viewsBaseUrl;

    this._sdk = sdk;
  }

  public async listViews(space: string, includeInheritedProperties: boolean = true): Promise<{ views: Array<ViewItem> }> {

    const result = await this._sdk.get(this._listViewsEndpoint, { params: {
      includeInheritedProperties, space
    }
    });
    
    if (result.status === 200) {
      return { views: result.data.items as Array<ViewItem>};
    }
    throw new Error(`Failed to list views. Status: ${result.status}`);
  }

  public async searchInstances<PropertiesType = Record<string, unknown>>(
    searchedView: Source,
    query: string,
    instanceType?: InstanceType,
    limit?: number,
    filter?: any,
    properties?: Array<string>,
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }> 

  public async searchInstances<PropertiesType = Record<string, unknown>>(
    searchedView: Source,
    query: string,
    instanceType?: 'edge',
    limit?: number,
    filter?: any,
    properties?: Array<string>,
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }> 

  public async searchInstances<PropertiesType = Record<string, unknown>>(
    searchedView: Source,
    query: string,
    instanceType?: 'node',
    limit?: number,
    filter?: any,
    properties?: Array<string>,
  ): Promise<{ instances: Array<NodeItem<PropertiesType>> }> 

  public async searchInstances<PropertiesType = Record<string, unknown>>(
    searchedView: Source,
    query: string,
    instanceType?: InstanceType,
    limit: number = 1000,
    filter?: any,
    properties?: Array<string>,
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }>  {
    const data: any = { view: searchedView, query, instanceType, filter, properties, limit };

    const result = await this._sdk.post(this._searchEndpoint, { data });

    if (result.status === 200) {
      hoistInstanceProperties(searchedView, result.data.items);

      return { instances: result.data.items };
    }
    throw new Error(`Failed to search for instances. Status: ${result.status}`);
  }

  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>>; nextCursor?: string }>;

  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: 'node',
    source?: Source,
    cursor?: string
  ): Promise<{ instances: Array<any>; nextCursor?: string }>;

  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: 'edge',
    source?: Source,
    cursor?: string
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>>; nextCursor?: string }>;

  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: InstanceType,
    source: Source,
    cursor?: string
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>>; nextCursor?: string }> {
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

    const typedResult = result.data.items as Array<EdgeItem<Record<string, any>> | NodeItem<Record<string, any>>>;

    hoistInstanceProperties(source, typedResult);

    return {
      instances: result.data.items,
      nextCursor: result.data.nextCursor
    };
  }
  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: InstanceType,
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType> | NodeItem<PropertiesType>> }>

  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: 'edge',
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }>

  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: 'edge',
    source?: Source
  ): Promise<{ instances: Array<EdgeItem<PropertiesType>> }>

  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: any,
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

  public async inspectInstances(inspectFilter: InspectFilter): Promise<InspectResultList> {
    const data: any = inspectFilter;
    const result = await this._sdk.post(this._inspectEndpoint, { data });

    if (result.status === 200) {
      return result.data as InspectResultList;
    }

    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}

function hoistInstanceProperties(source: Source, instances: Array<EdgeItem<Record<string, any>> | NodeItem<Record<string, any>>>): void {
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