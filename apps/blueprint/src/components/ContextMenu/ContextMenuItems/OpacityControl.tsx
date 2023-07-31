import { ChangeEventHandler } from 'react';
import { Menu } from '@cognite/cogs.js';

type OpacityControlProps = {
  opacity: number;
  onOpacityChange: ChangeEventHandler<HTMLInputElement>;
  header: string;
};

const OpacityControl = ({
  opacity,
  header,
  onOpacityChange,
}: OpacityControlProps) => {
  return (
    <>
      <Menu.Header>{header}</Menu.Header>
      <input
        type="range"
        min="0"
        max="1"
        value={opacity}
        onChange={onOpacityChange}
        step="0.01"
      />
    </>
  );
};

export default OpacityControl;
