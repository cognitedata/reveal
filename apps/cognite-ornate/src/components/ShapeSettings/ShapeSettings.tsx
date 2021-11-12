import { Menu } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import { ChangeEvent } from 'react';
import { ShapeSettings as ShapeSettingsType } from '@cognite/ornate';
import {
  defaultColor,
  defaultColorTransparent,
  getOpacityFromRGBA,
  hexToRGBA,
  isHexColor,
  setOpacityFromRGBA,
} from 'components/ContextMenu/ContextMenuItems/utils';

import ColorPicker from './ColorPicker/ColorPicker';
import { ShapeSettingsWrapper } from './elements';

type ShapeSettingsProps = {
  shapeSettings: ShapeSettingsType;
  isSidebarExpanded: boolean;
  onSettingsChange: (nextSettings: Partial<ShapeSettingsType>) => void;
};

const ShapeSettings = ({
  shapeSettings: {
    stroke = defaultColorTransparent,
    fill = defaultColor,
    strokeWidth,
    fontSize,
    tool,
  },
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
    const strokeOpacity =
      (stroke && isHexColor(stroke) && (hexToRGBA(stroke, true) as string)) ||
      stroke;
    const fillOpacity =
      (fill && isHexColor(fill) && (hexToRGBA(fill, true) as string)) || fill;

    onSettingsChange({
      stroke: setOpacityFromRGBA(strokeOpacity, e.target.value),
      fill: setOpacityFromRGBA(fillOpacity, e.target.value),
    });
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
              step="1"
            />
            <p>Thickness</p>
            <input
              type="range"
              min="0"
              max="1"
              value={Number(getOpacityFromRGBA(stroke))}
              onChange={onOpacitySliderChange}
              step="0.01"
            />
            <p>Opacity</p>
          </>
        )}
        <Menu.Header>COLOR</Menu.Header>
        <ColorPicker
          color={stroke || fill}
          onSettingsChange={onSettingsChange}
        />
      </Menu>
    </ShapeSettingsWrapper>
  );
};

export default ShapeSettings;
