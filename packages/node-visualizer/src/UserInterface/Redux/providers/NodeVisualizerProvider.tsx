import React from 'react';
import { Provider } from 'react-redux';

import { BaseRootNode } from '../../../Core/Nodes/BaseRootNode';
import {
  NodeVisualizer,
  NodeVisualizerProps,
} from '../../../UserInterface/NodeVisualizer/NodeVisualizer';
import { getStore } from '../State/store';

export const NodeVisualizerProvider: React.FC<
  React.PropsWithChildren<
    { root: BaseRootNode } & Exclude<NodeVisualizerProps, 'root'>
  >
> = ({ root, toolbar, explorer, unit, children }) => {
  return (
    <Provider store={getStore()}>
      <NodeVisualizer
        root={root}
        toolbar={toolbar}
        explorer={explorer}
        unit={unit}
      />
      {children}
    </Provider>
  );
};
