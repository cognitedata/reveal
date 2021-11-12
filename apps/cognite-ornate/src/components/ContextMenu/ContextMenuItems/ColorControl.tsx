import { Menu } from '@cognite/cogs.js';
import { PRESET_COLORS } from 'components/ShapeSettings/constants';
import { CirclePicker, ColorChangeHandler } from 'react-color';

type ColorControlProps = {
  header: string;
  color: string;
  onColorChange: ColorChangeHandler;
};

const ColorControl = ({ header, color, onColorChange }: ColorControlProps) => {
  return (
    <>
      <Menu.Header>{header}</Menu.Header>
      <CirclePicker
        color={color}
        colors={PRESET_COLORS}
        circleSize={24}
        width="190px"
        onChange={onColorChange}
      />
    </>
  );
};

export default ColorControl;
