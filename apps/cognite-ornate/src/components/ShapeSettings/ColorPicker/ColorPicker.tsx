import { useMetrics } from '@cognite/metrics';
import { ShapeSettings } from '@cognite/ornate';
import {
  defaultColor,
  getRGBAString,
} from 'components/ContextMenu/ContextMenuItems/utils';
import { CirclePicker, ColorResult } from 'react-color';

import { PRESET_COLORS } from '../constants';

type ColorPickerProps = {
  color: string;
  onSettingsChange: (nextSettings: Partial<ShapeSettings>) => void;
};

export default function ColorPicker({
  color = defaultColor,
  onSettingsChange,
}: ColorPickerProps) {
  const metrics = useMetrics('ColorPicker');
  const onBrushColorChange = (color: ColorResult) => {
    const { r, g, b, a = 1 } = color.rgb;
    const colorString = getRGBAString(r, g, b, a);
    metrics.track('onBrushColorChange', { color: colorString });
    onSettingsChange({ stroke: colorString, fill: colorString });
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <CirclePicker
        color={color}
        colors={PRESET_COLORS}
        circleSize={24}
        width="190px"
        onChange={onBrushColorChange}
      />
    </div>
  );
}
