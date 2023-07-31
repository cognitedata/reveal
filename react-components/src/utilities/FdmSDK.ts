/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk';

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

export type EdgeItem<PropertiesType> = {
  startNode: DmsUniqueIdentifier;
  endNode: DmsUniqueIdentifier;
  properties: PropertiesType;
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

export class FdmSDK {
  private readonly _sdk: CogniteClient;
  private readonly _byIdsEndpoint: string;
  private readonly _listEndpoint: string;
  private readonly _inspectEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    const instancesBaseUrl = `${baseUrl}/api/v1/projects/${project}/models/instances`;

    this._listEndpoint = `${instancesBaseUrl}/list`;
    this._byIdsEndpoint = `${instancesBaseUrl}/byids`;
    this._inspectEndpoint = `${instancesBaseUrl}/inspect`;

    this._sdk = sdk;
  }

  public async filterInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<{ edges: Array<EdgeItem<PropertiesType>>; nextCursor?: string }> {
    const data: any = { filter, instanceType };
    if (source !== null) {
      data.sources = [{ source }];
    }
    if (cursor !== undefined) {
      data.cursor = cursor;
    }

    const result = await this._sdk.post(this._listEndpoint, { data });
    if (result.status === 200) {
      return {
        edges: result.data.items as Array<EdgeItem<PropertiesType>>,
        nextCursor: result.data.nextCursor
      };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async filterAllInstances<PropertiesType = Record<string, any>>(
    filter: any,
    instanceType: InstanceType,
    source?: Source
  ): Promise<{ edges: Array<EdgeItem<PropertiesType>> }> {
    let mappings = await this.filterInstances<PropertiesType>(filter, instanceType, source);

    while (mappings.nextCursor !== undefined) {
      const nextMappings = await this.filterInstances<PropertiesType>(
        filter,
        instanceType,
        source,
        mappings.nextCursor
      );

      mappings = {
        edges: [...mappings.edges, ...nextMappings.edges],
        nextCursor: nextMappings.nextCursor
      };
    }

    return { edges: mappings.edges };
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
