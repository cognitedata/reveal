import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { ChangeEvent, useState } from 'react';

import { FontSizeControlWrapper } from './elements';

type FontSizeControlProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
};

const FontSizeControl = ({ selectedNode, metrics }: FontSizeControlProps) => {
  const [fontSize, setFontSize] = useState<number>(
    selectedNode.getAttr('fontSize')
  );

  const onFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onFontSizeChange', { value: e.target.value });
    selectedNode.setAttr('fontSize', Number(e.target.value));
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
