import {
  List as AutomergeList,
  Extend as AutomergeExtend,
} from '@automerge/automerge';
import { IconType } from '@cognite/cogs.js';
import { Edge, Node } from 'reactflow';

/***************/
/* PARENT NODE */
/***************/

type ParentNodeData = {
  label: string;
};
type ParentNode = BaseWorkflowBuilderNode<'parent', ParentNodeData>;

/****************/
/* PROCESS NODE */
/****************/

export const PROCESS_TYPES = ['transformation', 'function'] as const;
export type ProcessType = typeof PROCESS_TYPES[number];
export const PROCESS: Record<string, ProcessType> = {
  TRANSFORMATION: 'transformation',
  FUNCTION: 'function',
};
export const PROCESS_ICON: Record<ProcessType, IconType> = {
  transformation: 'Code',
  function: 'Function',
};

export const isProcessType = (t?: string): t is ProcessType => {
  return !!t && PROCESS_TYPES.includes(t as ProcessType);
};

export type ProcessDescription = string;
export type ProcessItem = string;

type BaseProcessNodeData<
  T extends ProcessType,
  D extends ProcessDescription,
  I extends ProcessItem,
  P = {}
> = {
  processExternalId?: string;
  processType: T;
  processDescription: D;
  processItem: I;
  processProps: P;
};

type TransformationNodeProps = {
  id?: number;
};
type TransformationNodeData = BaseProcessNodeData<
  'transformation',
  string,
  string,
  TransformationNodeProps
>;

type FunctionNodeProps = {};
type FunctionNodeData = BaseProcessNodeData<
  'function',
  string,
  string,
  FunctionNodeProps
>;

export type ProcessNodeData = TransformationNodeData | FunctionNodeData;
export type ProcessNode = BaseWorkflowBuilderNode<'process', ProcessNodeData>;

/********************/
/* WORKFLOW BUILDER */
/********************/

export const WORKFLOW_BUILDER_NODE_TYPES = ['process', 'parent'] as const;
export type WorkflowBuilderNodeType =
  typeof WORKFLOW_BUILDER_NODE_TYPES[number];
export const WORFKLOW_BUILDER_NODE: Record<string, WorkflowBuilderNodeType> = {
  PROCESS: 'process',
  PARENT: 'parent',
};

type BaseWorkflowBuilderNode<T extends WorkflowBuilderNodeType, D = {}> = Node<
  D,
  T
>;

export type WorkflowBuilderNode = ProcessNode | ParentNode;

export type CanvasNode = AutomergeExtend<WorkflowBuilderNode>;
export type CanvasNodes = AutomergeList<CanvasNode>;

export type CanvasEdge = AutomergeExtend<Edge<any>>; // FIXME: any
export type CanvasEdges = AutomergeList<CanvasEdge>;

export type Canvas = {
  nodes: CanvasNodes;
  edges: CanvasEdges;
};

export type Flow = {
  id: string;
  name: string;
  updated?: number;
  description?: string;
  canvas: Canvas;
};

export type AFlow = AutomergeExtend<Flow>;

export type Items<T> = {
  items: T[];
};

export type SdkListData<T> = {
  items: T[];
  nextCursor?: string;
};

export type Runtime = 'py37' | 'py38' | 'py39' | 'py310' | 'py311' | 'py312'; // Future proofing.

export interface CogFunctionUpload {
  name: string;
  fileId: number;
  owner: string;
  description?: string;
  apiKey?: string;
  memory?: number;
  cpu?: number;
  secrets?: {};
  metadata?: {};
  externalId?: string;
  runtime?: Runtime;
}

export interface CogFunction extends CogFunctionUpload {
  id: number;
  createdTime: number;
  status: 'Queued' | 'Deploying' | 'Ready' | 'Failed';
  error?: Error;
  runtimeVersion?: string;
}
