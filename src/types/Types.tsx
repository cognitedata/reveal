export interface RelationshipResource {
  resource:
    | 'timeSeries'
    | 'threeD'
    | 'threeDRevision'
    | 'asset'
    | 'event'
    | 'file';
  resourceId: string;
}

export type RelationshipType =
  | 'flowsTo'
  | 'belongsTo'
  | 'isParentOf'
  | 'implements';
export interface Relationship {
  source: RelationshipResource;
  target: RelationshipResource;
  confidence: number;
  dataSet: string;
  externalId: string;
  relationshipType: RelationshipType;
}

export type ModelStatus =
  | 'New'
  | 'Scheduled'
  | 'Queued'
  | 'Completed'
  | 'Running'
  | 'Failed';

export interface Function {
  id: number;
  name: string;
  fileId: number;
  owner: string;
  description: string;
  apiKey: string;
  secrets: {};
  createdTime: Date;
  status: 'Queued' | 'Deploying' | 'Ready' | 'Failed';
  externalId: string;
  error?: Error;
}

export interface Error {
  message: string;
  trace: string;
}

export interface Call {
  id: number;
  startTime: Date;
  endTime: Date;
  status: 'Running' | 'Completed' | 'Failed' | 'Timeout';
  error?: Error;
}

export interface CallResponse {
  callId: number;
  functionId: number;
  response: any;
}

export interface Log {
  timestamp: Date;
  message: string;
}

export interface Schedule {
  id: number;
  createdTime: Date;
  name: string;
  description?: string;
  functionExternalId: string;
  cronExpression: string;
  data?: {};
}
