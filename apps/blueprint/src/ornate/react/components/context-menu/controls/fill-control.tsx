import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';

import { ColorPicker } from '../..';

import * as S from './elements';
import { ControlProps } from './types';

export const FillControl: React.FC<ControlProps> = ({ instance, nodes }) => {
  const [color, setColor] = useState(nodes[0].attrs.fill);

  useEffect(() => {
    setColor(nodes[0].attrs.fill);
  }, [nodes]);

  const renderContent = () => {
    return <S.FillControlButton style={{ background: color }} />;
  };

  const handleColorChange = (nextColor: string) => {
    nodes.forEach((n) => {
      n.setAttr('fill', nextColor);
    });
    setColor(nextColor);
    instance.emitSaveEvent();
  };

  return (
    <Dropdown
      content={
        <Menu>
          <ColorPicker color={color} onColorChange={handleColorChange} />
        </Menu>
      }
    >
      <Button type="ghost">{renderContent()}</Button>
    </Dropdown>
  );
};
