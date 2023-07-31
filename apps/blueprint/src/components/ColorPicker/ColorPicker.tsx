/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useCallback } from 'react';
import { useMetrics } from '@cognite/metrics';
import { Icon } from '@cognite/cogs.js';
import Color from 'color';
import { PRESET_COLORS } from 'consts';

import { ColorPickerWrapper } from './elements';

const defaultColor = new Color('red');

type ColorPickerProps = {
  color: string;
  onColorChange: (newColor: string) => void;
};

type ColorItemProps = {
  colorHex: string;
  selected: boolean;
  onClick: () => void;
};

const ColorItem = ({ colorHex, selected, onClick }: ColorItemProps) => (
  <div
    className="color-selector-item"
    style={{
      backgroundColor: colorHex,
    }}
    onClick={onClick}
  >
    {selected && <Icon type="Checkmark" className="selected" />}
  </div>
);

const ColorPicker = ({
  color = defaultColor.string(),
  onColorChange,
}: ColorPickerProps) => {
  const metrics = useMetrics('ColorPicker');
  const newColor = new Color(color);

  const onColorSelect = useCallback(
    (colorHex: string, colorString: string) => {
      metrics.track('onBrushColorChange', { color: colorHex });
      onColorChange(colorString);
    },
    [metrics, onColorChange]
  );

  return (
    <ColorPickerWrapper>
      {PRESET_COLORS.map((c) => {
        const colorHex = c.hex();
        const colorString = c.alpha(newColor.alpha()).string();
        return (
          <ColorItem
            key={colorHex}
            selected={newColor.hex() === colorHex}
            colorHex={colorHex}
            onClick={() => onColorSelect(colorHex, colorString)}
          />
        );
      })}
    </ColorPickerWrapper>
  );
};

export default ColorPicker;
