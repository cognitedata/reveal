import { useMetrics } from '@cognite/metrics';
import { ShapeSettings } from 'library/types';
import { CirclePicker, ColorResult } from 'react-color';

import { PRESET_COLORS } from '../constants';

type ColorPickerProps = {
  color: string;
  onSettingsChange: (nextSettings: Partial<ShapeSettings>) => void;
};

export default function ColorPicker({
  color = PRESET_COLORS[0],
  onSettingsChange,
}: ColorPickerProps) {
  const metrics = useMetrics('ColorPicker');
  const onBrushColorChange = (color: ColorResult) => {
    metrics.track('onBrushColorChange', { color: color.hex });
    onSettingsChange({ strokeColor: color.hex, fill: color.hex });
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
