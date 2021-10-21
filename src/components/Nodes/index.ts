import { StorableNode } from 'models/chart/types';
import { FunctionComponent } from 'react';
import * as DSPToolboxFunction from './DSPToolboxFunction';
import * as TimeSeriesReference from './TimeSeriesReference';
import * as SourceReference from './SourceReference';
import * as Constant from './Constant';
import * as OutputSeries from './OutputSeries';

export type NodeOption = {
  name: string; // Outward name when selecting the node
  node: StorableNode; // The STORABLE node (without its function effect)
  disabled?: boolean;

  // Some nodes (e.g. output nodes) won't have an effect or data
  effect?: (funcData: object, ...inputPinValues: any[]) => Record<string, any>; // out = Output pin values
  effectId?: string;

  ConfigPanel?: ConfigPanelComponent;
};

export type ConfigPanelComponentProps = {
  node: StorableNode;
  nodes?: StorableNode[];
  onUpdateNode: (nextNode: StorableNode) => void;
  context: any;
};

export type ConfigPanelComponent = FunctionComponent<ConfigPanelComponentProps>;

export default [
  {
    name: 'Time Series',
    ...TimeSeriesReference,
    disabled: true,
  },
  {
    name: 'Input',
    ...SourceReference,
  },
  {
    name: 'Constant',
    ...Constant,
  },
  {
    name: 'Function',
    ...DSPToolboxFunction,
  },
  {
    name: 'Output',
    ...OutputSeries,
  },
] as NodeOption[];
