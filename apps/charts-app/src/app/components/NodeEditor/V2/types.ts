import {
  ConstantNodeCallbacks,
  ConstantNodeData,
  ConstantNodeDataDehydrated,
} from './Nodes/ConstantNode';
import {
  FunctionNodeCallbacks,
  FunctionNodeData,
  FunctionNodeDataDehydrated,
} from './Nodes/FunctionNode/FunctionNode';
import {
  OutputNodeCallbacks,
  OutputNodeData,
  OutputNodeDataDehydrated,
} from './Nodes/OutputNode';
import {
  SourceNodeCallbacks,
  SourceNodeData,
  SourceNodeDataDehydrated,
} from './Nodes/SourceNode';

export enum NodeTypes {
  SOURCE = 'CalculationInput',
  FUNCTION = 'ToolboxFunction',
  CONSTANT = 'Constant',
  OUTPUT = 'CalculationOutput',
}

export type SourceOption = {
  type: 'timeseries' | 'workflow';
  color: string;
  label: string;
  value: string;
};

/**
 * Format used in the view
 */
export type NodeDataVariants =
  | SourceNodeData
  | ConstantNodeData
  | FunctionNodeData
  | OutputNodeData;

/**
 * Format stored in the data layer
 */
export type NodeDataDehydratedVariants =
  | SourceNodeDataDehydrated
  | ConstantNodeDataDehydrated
  | FunctionNodeDataDehydrated
  | OutputNodeDataDehydrated;

/**
 * Node callback types
 */
export type NodeCallbacks = SourceNodeCallbacks &
  ConstantNodeCallbacks &
  FunctionNodeCallbacks &
  OutputNodeCallbacks;
