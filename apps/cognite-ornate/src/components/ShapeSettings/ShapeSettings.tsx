import { Menu } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import { ChangeEvent } from 'react';

import { ShapeSettings as ShapeSettingsType } from '../../library/types';

import ColorPicker from './ColorPicker/ColorPicker';
import { ShapeSettingsWrapper } from './elements';

type ShapeSettingsProps = {
  shapeSettings: ShapeSettingsType;
  isSidebarExpanded: boolean;
  onSettingsChange: (nextSettings: Partial<ShapeSettingsType>) => void;
};

const ShapeSettings = ({
  shapeSettings: { strokeColor, strokeWidth, opacity, fontSize, tool },
  isSidebarExpanded,
  onSettingsChange,
}: ShapeSettingsProps) => {
  const metrics = useMetrics('ShapeSettings');
  const onThicknessSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onThicknessSliderChange', { value: e.target.value });
    onSettingsChange({ strokeWidth: Number(e.target.value) });
  };

  const onOpacitySliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onOpacitySliderChange', { value: e.target.value });
    onSettingsChange({ opacity: Number(e.target.value) });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onFontSizeChange', { value: e.target.value });
    onSettingsChange({ fontSize: Number(e.target.value) });
  };

  return (
    <ShapeSettingsWrapper className={isSidebarExpanded ? 'expanded' : ''}>
      <Menu>
        {tool === 'text' ? (
          <>
            <Menu.Header>Font Size</Menu.Header>
            <input
              type="number"
              min="1"
              max="101"
              value={fontSize}
              onChange={onFontSizeChange}
              step="1"
            />
          </>
        ) : (
          <>
            <Menu.Header>STROKE</Menu.Header>
            <input
              type="range"
              min="1"
              max="101"
              value={strokeWidth}
              onChange={onThicknessSliderChange}
              step="10"
            />
            <p>Thickness</p>
            <input
              type="range"
              min="0.1"
              max="1"
              value={opacity}
              onChange={onOpacitySliderChange}
              step="0.1"
            />
            <p>Opacity</p>
          </>
        )}
        <Menu.Header>COLOR</Menu.Header>
        <ColorPicker color={strokeColor} onSettingsChange={onSettingsChange} />
      </Menu>
    </ShapeSettingsWrapper>
  );
};

export default ShapeSettings;
