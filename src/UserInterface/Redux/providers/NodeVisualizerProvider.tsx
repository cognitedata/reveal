import React from 'react';
import { Provider } from 'react-redux';

import { BaseRootNode } from '@/Core/Nodes/BaseRootNode';
import { NodeVisualizer } from '@/UserInterface/NodeVisualizer/NodeVisualizer';
import { getStore } from '../State/store';

export const NodeVisualizerProvider: React.FC<{ root: BaseRootNode }> = ({
  root,
  children,
}) => {
  return (
    <Provider store={getStore()}>
      <NodeVisualizer root={root} />
      {children}
    </Provider>
  );
};
