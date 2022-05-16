import { useCallback } from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import chroma from 'chroma-js';

import { defaultColor, PRESET_COLORS } from '../../../utils';
import { OpacitySlider } from '../opacity-slider';

import * as S from './elements';

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
  <Button
    unstyled
    className="color-selector-item"
    style={{
      backgroundColor: colorHex,
    }}
    onClick={onClick}
  >
    {selected && <Icon type="Checkmark" className="selected" />}
  </Button>
);

export const ColorPicker = ({
  color = defaultColor.string(),
  onColorChange,
}: ColorPickerProps) => {
  const newColor = chroma(color);

  const onColorSelect = useCallback(
    (colorHex: string, colorString: string) => {
      onColorChange(colorString);
    },
    [onColorChange]
  );

  return (
    <S.ColorPicker>
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
      <div style={{ padding: 8, width: '100%' }}>
        <OpacitySlider
          $color={newColor.alpha(1).hex()}
          min={0}
          max={1}
          value={[newColor.alpha()]}
          step={0.05}
          marks={{}}
          setValue={(next) =>
            onColorSelect(newColor.hex(), newColor.alpha(next[0]).css())
          }
        />
      </div>
    </S.ColorPicker>
  );
};

export default ColorPicker;
