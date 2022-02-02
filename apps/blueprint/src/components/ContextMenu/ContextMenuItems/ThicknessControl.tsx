import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { Node, NodeConfig } from 'konva/lib/Node';
import { ChangeEvent, useState } from 'react';
import { UpdateKeyType } from '@cognite/ornate';

type ThicknessControlProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
  updateShape: (
    shape: Node<NodeConfig>,
    updateKey: UpdateKeyType,
    updateValue: string | number
  ) => void;
};

const ThicknessControl = ({
  selectedNode,
  metrics,
  updateShape,
}: ThicknessControlProps) => {
  const [strokeWidth, setStrokeWidth] = useState<number>(
    selectedNode.getAttr('strokeWidth')
  );
  const onThicknessSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onThicknessSliderChange', { value: e.target.value });
    updateShape(selectedNode, 'strokeWidth', Number(e.target.value));
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
