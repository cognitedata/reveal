import { ViewReference } from './dms-view-dtos';

export interface NodeViewWrite {
  instanceType: 'node';
  space: string;
  existingVersion?: number;
  externalId: string;
  sources: Array<{
    source: { type: 'view' } & ViewReference;
    properties: any;
  }>;
}

export interface EdgeViewWrite {
  instanceType?: 'edge';
  type: DirectRelationReference;
  space: string;
  externalId: string;
  existingVersion?: number;
  startNode: DirectRelationReference;
  endNode: DirectRelationReference;
  sources?: Array<{
    source: { type: 'view' } & ViewReference;
    properties: any;
  }>;
}

export interface DirectRelationReference {
  space: string;
  externalId: string;
}

export interface IngestRequestDTO {
  items: (NodeViewWrite | EdgeViewWrite)[];
  autoCreateStartNodes?: boolean;
  autoCreateEndNodes?: boolean;
  replace?: boolean;
  skipOnVersionConflict?: boolean;
}
export interface DeleteRequestDTO {
  items: {
    instanceType: 'node' | 'edge';
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
