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

export interface CogFunction {
  id: number;
  name: string;
  fileId: number;
  owner: string;
  description: string;
  apiKey: string;
  secrets: {};
  createdTime: Date;
  status: 'Queued' | 'Deploying' | 'Ready' | 'Failed';
  externalId?: string;
  error?: Error;
  calls?: Call[];
}

export interface Error {
  message: string;
  trace: string;
}

type CallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';

export interface Call {
  id: number;
  startTime: Date;
  endTime: Date;
  status: CallStatus;
  error?: Error;
}

export interface CallResponse {
  id: number;
  functionId: number;
  response: any;
  status: CallStatus;
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
