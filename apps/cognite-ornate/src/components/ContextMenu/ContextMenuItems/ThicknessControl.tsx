import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { ChangeEvent, useState } from 'react';

type ThicknessControlProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
};

const ThicknessControl = ({ selectedNode, metrics }: ThicknessControlProps) => {
  const [strokeWidth, setStrokeWidth] = useState<number>(
    selectedNode.getAttr('strokeWidth')
  );
  const onThicknessSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onThicknessSliderChange', { value: e.target.value });
    selectedNode.setAttr('strokeWidth', Number(e.target.value));
    setStrokeWidth(Number(e.target.value));
  };

  return (
    <>
      <Menu.Header>Thickness</Menu.Header>
      <input
        type="range"
        min="1"
        max="101"
        value={strokeWidth}
        onChange={onThicknessSliderChange}
        step="1"
      />
    </>
  );
};

export default ThicknessControl;
