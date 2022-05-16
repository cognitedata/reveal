import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';

import { ColorPicker } from '../..';

import * as S from './elements';
import { ControlProps } from './types';

const ThicknessSlider = ({
  thickness,
  setThickness,
  color,
}: {
  thickness: number;
  setThickness: (next: number) => void;
  color: string;
}) => {
  const THICKNESS_OPTIONS = [8, 12, 16, 20, 24];
  const handlePlus = () => {
    setThickness(thickness + 4);
  };
  const handleMinus = () => {
    setThickness(Math.max(0, thickness - 4));
  };
  return (
    <S.ThicknessSliderWrapper>
      <Button type="link" icon="Minus" size="small" onClick={handleMinus} />
      {THICKNESS_OPTIONS.map((opt) => (
        <S.ThicknessOption
          key={opt}
          $thickness={opt}
          $isSelected={thickness === opt}
          $color={color || 'grey'}
          onClick={() => {
            setThickness(opt);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setThickness(opt);
            }
          }}
          tabIndex={0}
        />
      ))}
      <Button type="link" icon="Plus" size="small" onClick={handlePlus} />
    </S.ThicknessSliderWrapper>
  );
};

export const StrokeControl: React.FC<ControlProps> = ({ instance, nodes }) => {
  const [color, setColor] = useState(nodes[0].attrs.stroke);
  const [thickness, setThickness] = useState<number>(
    nodes[0].attrs.strokeWidth || 1
  );

  useEffect(() => {
    setColor(nodes[0].attrs.stroke);
    setThickness(nodes[0].attrs.strokeWidth);
  }, [nodes]);

  const renderContent = () => {
    return (
      <S.StrokeControlButton
        style={{
          border: `4px solid ${color}`,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, .1)',
        }}
      />
    );
  };

  const handleColorChange = (nextColor: string) => {
    nodes.forEach((n) => {
      n.setAttr('stroke', nextColor);
    });
    setColor(nextColor);
    instance.emitSaveEvent();
  };

  const handleThicknessChange = (nextThickness: number) => {
    nodes.forEach((n) => {
      n.setAttr('strokeWidth', nextThickness);
    });
    setThickness(nextThickness);
    instance.emitSaveEvent();
  };

  return (
    <Dropdown
      content={
        <Menu>
          <ColorPicker color={color} onColorChange={handleColorChange} />
          <div style={{ padding: 8 }}>
            <ThicknessSlider
              thickness={thickness || 1}
              setThickness={handleThicknessChange}
              color={color}
            />
          </div>
        </Menu>
      }
    >
      <Button type="ghost">{renderContent()}</Button>
    </Dropdown>
  );
};
