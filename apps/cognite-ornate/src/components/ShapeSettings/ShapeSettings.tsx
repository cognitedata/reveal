import React, { ChangeEvent, useContext } from 'react';
import { Menu } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import Color from 'color';
import { OrnateContext, PREDEFINED_STYLES } from 'context';
import { PredefinedStyle } from 'context/types';
import { ShapeConfig } from 'konva/lib/Shape';

import { ColorPicker } from '../ColorPicker';
import { PredefinedStylesDropdown } from '../PredefinedStyles';

import { ShapeSettingsWrapper } from './elements';

type ShapeSettingsProps = {
  isSidebarExpanded: boolean;
};

const ShapeSettings = ({ isSidebarExpanded }: ShapeSettingsProps) => {
  const metrics = useMetrics('ShapeSettings');
  const {
    shapeSettings,
    onShapeSettingsChange,
    activeTool,
    predefinedStyle,
    setPredefinedStyle,
  } = useContext(OrnateContext);
  const currentShapeConfig: ShapeConfig = shapeSettings[
    activeTool
  ] as ShapeConfig;
  const { fontSize, fill, stroke, strokeWidth } = currentShapeConfig;
  const fillOrStrokeKey = activeTool === 'text' ? 'fill' : 'stroke';
  const fillOrStroke = new Color(currentShapeConfig?.[fillOrStrokeKey]);

  const onThicknessSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onThicknessSliderChange', { value: e.target.value });
    onShapeSettingsChange({
      [activeTool]: {
        ...currentShapeConfig,
        strokeWidth: Number(e.target.value),
      },
    });
  };

  const onOpacitySliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onOpacitySliderChange', { value: e.target.value });
    const newOpacity = Number(e.target.value);
    onShapeSettingsChange({
      [activeTool]: {
        ...currentShapeConfig,
        [fillOrStrokeKey]: fillOrStroke.alpha(newOpacity).string(),
      },
    });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onFontSizeChange', { value: e.target.value });
    onShapeSettingsChange({
      [activeTool]: {
        ...currentShapeConfig,
        fontSize: Number(e.target.value),
      },
    });
  };

  const onPredefinedStyleChange = (style: PredefinedStyle) => {
    setPredefinedStyle({
      label: style.label,
      value: style.value,
    });

    onShapeSettingsChange({
      [activeTool]: {
        ...currentShapeConfig,
        [fillOrStrokeKey]: style.value.alpha(fillOrStroke.alpha()).string(),
        predefinedStyle: style.label,
      },
    });
  };

  const onColorChange = (newColor: string) => {
    const color = new Color(newColor);
    metrics.track('onColorChange', { value: newColor });

    const selectedStyle = PREDEFINED_STYLES.find(
      (s) => s.value.hex() === color.hex()
    );
    const label = selectedStyle ? selectedStyle.label : 'Custom';
    const value = selectedStyle ? selectedStyle.value : color;
    onPredefinedStyleChange({
      label,
      value,
    });
  };

  return (
    <ShapeSettingsWrapper className={isSidebarExpanded ? 'expanded' : ''}>
      <Menu>
        {Number.isInteger(fontSize) && (
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
            <Menu.Header>COLOR</Menu.Header>
          </>
        )}
        {activeTool === 'text' && fill && (
          <ColorPicker color={fill} onColorChange={onColorChange} />
        )}
        {stroke && (
          <PredefinedStylesDropdown
            predefinedStyle={predefinedStyle}
            onChange={onPredefinedStyleChange}
          />
        )}
        {strokeWidth && (
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
          </>
        )}
        {stroke && (
          <>
            <input
              type="range"
              min="0"
              max="1"
              value={fillOrStroke.alpha()}
              onChange={onOpacitySliderChange}
              step="0.01"
            />
            <p>Opacity</p>
            <Menu.Header>COLOR</Menu.Header>
            <ColorPicker
              color={
                predefinedStyle.value.alpha(fillOrStroke.alpha()).string() ||
                (stroke as string)
              }
              onColorChange={onColorChange}
            />
          </>
        )}
      </Menu>
    </ShapeSettingsWrapper>
  );
};

export default ShapeSettings;
