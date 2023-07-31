import { Button } from '@cognite/cogs.js';
import React from 'react';
import Konva from 'konva';

interface Props {
  selectedNode: Konva.Node;
}

export const ResetFilters: React.VFC<Props> = ({ selectedNode }) => {
  return (
    <Button
      key="ornateContextMenuResetControlButton"
      type="ghost"
      aria-label="resetControlButton"
      icon="Restore"
      onClick={() => {
        selectedNode.clearCache();
      }}
    />
  );
};
