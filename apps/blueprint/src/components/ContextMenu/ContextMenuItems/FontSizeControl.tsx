import { ChangeEvent, useState } from 'react';
import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { Node, NodeConfig } from 'konva/lib/Node';
import { UpdateKeyType } from '@cognite/ornate';

import { FontSizeControlWrapper } from './elements';

type FontSizeControlProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
  updateShape: (
    shape: Node<NodeConfig>,
    updateKey: UpdateKeyType,
    updateValue: string | number
  ) => void;
};

const FontSizeControl = ({
  selectedNode,
  metrics,
  updateShape,
}: FontSizeControlProps) => {
  const [fontSize, setFontSize] = useState<number>(
    selectedNode.getAttr('fontSize')
  );

  const onFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onFontSizeChange', { value: e.target.value });
    updateShape(selectedNode, 'fontSize', Number(e.target.value));
    setFontSize(Number(e.target.value));
  };

  return (
    <FontSizeControlWrapper>
      <Menu.Header>Font Size</Menu.Header>
      <input
        className="ornate-font-size-control"
        type="number"
        min="1"
        max="101"
        value={fontSize}
        onChange={onFontSizeChange}
        step="1"
      />
    </FontSizeControlWrapper>
  );
};

export default FontSizeControl;
