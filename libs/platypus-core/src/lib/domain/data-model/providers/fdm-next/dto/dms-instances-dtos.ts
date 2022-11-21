import { ContainerReference } from './dms-container-dtos';
import { ViewReference } from './dms-view-dtos';

export interface NodeViewWrite {
  instanceType: 'node';
  space: string;
  externalId: string;
  views: Array<{
    view: ViewReference;
    properties: any;
  }>;
}

export interface NodeContainerWrite {
  instanceType: 'node';
  space: string;
  externalId: string;
  containers: Array<{
    container: ContainerReference;
    properties: any;
  }>;
}

export interface EdgeViewWrite {
  instanceType?: 'edge';
  type: DirectRelationReference;
  space: string;
  externalId: string;
  autoCreateStartNodes: boolean;
  autoCreateEndNodes: boolean;
  startNode: DirectRelationReference;
  endNode: DirectRelationReference;
  views: Array<{
    view: ViewReference;
    properties: any;
  }>;
}

export interface DirectRelationReference {
  space: string;
  externalId: string;
}

export interface EdgeContainerWrite {
  instanceType?: 'edge';
  type: DirectRelationReference;
  space: string;
  externalId: string;
  autoCreateStartNodes: boolean;
  autoCreateEndNodes: boolean;
  startNode: DirectRelationReference;
  endNode: DirectRelationReference;
  containers: Array<{
    view: ContainerReference;
    properties: any;
  }>;
}

export interface IngestRequestDTO {
  items: (
    | NodeViewWrite
    | NodeContainerWrite
    | EdgeViewWrite
    | EdgeContainerWrite
  )[];
  replace?: boolean;
}
export interface DeleteRequestDTO {
  items: {
    type: 'node' | 'edge';
    externalId: string;
    space: string;
  }[];
}

export interface SlimNodeOrEdge {
  type: 'node' | 'edge';
  space: string;
  externalId: string;
  createdTime?: number;
  lastUpdatedTime?: number;
}
