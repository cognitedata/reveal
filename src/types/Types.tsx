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

export interface CogFunctionUpload {
  name: string;
  fileId: number;
  owner: string;
  description?: string;
  apiKey?: string;
  secrets?: {};
  externalId?: string;
}
export interface CogFunction extends CogFunctionUpload {
  id: number;
  createdTime: number;
  status: 'Queued' | 'Deploying' | 'Ready' | 'Failed';
  error?: Error;
  cpu: number;
  memory: number;
}

export interface Error {
  message: string;
  trace: string;
}

type CallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';

export interface CallResponse {
  id: number;
  functionId: number;
  response: any;
  status: CallStatus;
}

export interface Call extends CallResponse {
  startTime: number;
  endTime: number;
  error?: Error;
}

export interface Log {
  timestamp: number;
  message: string;
}

export interface CreateSchedule {
  name: string;
  description?: string;
  functionExternalId: string;
  cronExpression: string;
  data?: {};
}
export interface Schedule extends CreateSchedule {
  id: number;
  createdTime: number;
}
export type GetCallsArgs = {
  id: number;
  scheduleId?: number;
};
export type GetCallArgs = {
  id: number;
  callId: number;
};
