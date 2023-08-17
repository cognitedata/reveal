import { ProcessType } from '@flows/types';

export type WorkflowResponse = {
  externalId: string;
  description?: string;
  createdTime: string;
};

export type CreateWorkflowVariables = Pick<
  WorkflowResponse,
  'externalId' | 'description'
>;

type TaskType = 'function' | 'transformation' | 'http' | 'dynamic';

type TaskDepends = {
  externalId: string;
};

type FunctionParameters = {
  function: {
    externalId: string;
    data?: Object;
  };
  isAsyncComplete: boolean;
};

type TransformationParameters = {
  transformation: {
    externalId: string;
  };
};

type HttpRequestParameters = {
  httpRequest: {
    url: string;
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    body?: Object;
    headers?: Object;
    requestTimeoutInMillis?: number;
    cdfAuthenticated?: boolean;
  };
  isAsyncComplete: boolean;
};

type DynamicTaskParameters = {
  dynamic: {
    tasks: TaskDefinition[];
  };
};

type TaskParameters =
  | TransformationParameters
  | FunctionParameters
  | HttpRequestParameters
  | DynamicTaskParameters;

type FunctionOutput = {
  callId: number;
  functionId: number;
  response: Object;
};

type TransformationOutput = {
  jobId: number;
};

type HttpResponseOutput = {
  response: string | Object;
  headers: Object;
  statusCode: number;
};

type DynamicTaskOutput = {
  dynamicTasks: TaskDefinition[];
};

export type OutputType =
  | FunctionOutput
  | TransformationOutput
  | HttpResponseOutput
  | DynamicTaskOutput;

export type TaskDefinition = {
  externalId: string;
  type: TaskType;
  name?: string;
  description?: string;
  parameters: TaskParameters;
  retries?: number;
  timeout?: number;
  dependsOn?: TaskDepends[];
};

export type WorkflowDefinition = {
  description?: string;
  tasks: TaskDefinition[];
};

export type WorkflowDefinitionResponse = {
  hash: string;
  description?: string;
  tasks: TaskDefinition[];
};

export type WorkflowDefinitionCreate = Pick<
  WorkflowDefinitionResponse,
  'description' | 'tasks'
>;

export type WorkflowWithVersions = Pick<
  WorkflowResponse,
  'externalId' | 'createdTime'
> & {
  versions: { [version: string]: WorkflowDefinitionResponse };
};

export type CreateWorkflowDefinitionVariables = {
  externalId: string;
  version: string;
  workflowDefinition: WorkflowDefinitionCreate;
};

export type RunWorkflowVariables = {
  externalId: string;
  version: string;
  input?: Object;
};

export type TaskExecutionStatus =
  | 'IN_PROGRESS'
  | 'CANCELED'
  | 'FAILED'
  | 'FAILED_WITH_TERMINAL_ERROR'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'SCHEDULED'
  | 'TIMED_OUT'
  | 'SKIPPED';

export type TaskExecution = {
  id?: string;
  externalId?: string;
  status?: TaskExecutionStatus;
  taskType?: ProcessType;
  startTime?: number;
  endTime?: number;
  input?: Object;
  output?: OutputType;
};

export type WorkflowExecutionStatus =
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'TERMINATED'
  | 'PAUSED';

export type WorkflowExecution = {
  id: string;
  workflowExternalId: string;
  workflowDefinition?: WorkflowDefinitionResponse;
  engineExecutionId: string;
  version: string;
  status: WorkflowExecutionStatus;
  executedTasks?: TaskExecution[];
  input?: Object;
  createdTime: number;
  startTime?: number;
  endTime?: number;
  reasonForIncompletion?: string;
};

export type DeleteWorkflowVariables = {
  externalId: string;
};

export type ListExecutionsQuery = {
  filter: ListExecutionsFilter;
};

export type ListExecutionsFilter = {
  workflowFilters?: WorkflowFilter;
  createdTimeStart?: number;
  createdTimeEnd?: number;
};

export type WorkflowFilter = {
  externalId: string;
  version?: string;
};

export type UpdateTaskVariables = {
  taskId: string;
  status: 'COMPLETED' | 'FAILED';
  output?: Object;
};
