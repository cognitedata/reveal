import { Input } from '@cognite/cogs.js';

import { ColorPicker, ThicknessSlider } from '..';

import { StyleSelectorWrapper } from './elements';
import { Pen } from './pen';

export type NodeStyle = {
  fill?: string;
  stroke?: string;
  fontSize?: string;
  strokeWidth?: number;
};

type StyleSelectorProps = {
  style?: NodeStyle;
  onChange?: (nextStyle: NodeStyle) => void;
};

export const StyleSelector = ({ style, onChange }: StyleSelectorProps) => {
  const handleStyleChange = (nextStyle: NodeStyle) => {
    if (onChange) {
      onChange({ ...style, ...nextStyle });
    }
  };
  const renderStyles = () => {
    const nodes = [];
    if (style?.fontSize) {
      nodes.push(
        <Input
          style={{ marginBottom: 16, width: '100%' }}
          type="number"
          value={style?.fontSize}
          onChange={(e) => handleStyleChange({ fontSize: e.target.value })}
        />
      );
    }

    if (style?.fill) {
      nodes.push(
        <div>
          <h5>Fill</h5>
          <ColorPicker
            color={style?.fill}
            onColorChange={(next) => handleStyleChange({ fill: next })}
          />
        </div>
      );
    }

    if (style?.stroke) {
      nodes.push(
        <div>
          <h5>Stroke</h5>
          <ColorPicker
            color={style?.stroke}
            onColorChange={(next) => handleStyleChange({ stroke: next })}
          />
        </div>
      );
    }

    if (style?.strokeWidth) {
      nodes.push(
        <ThicknessSlider
          color={style?.stroke || style.fill || 'grey'}
          thickness={style?.strokeWidth}
          onThicknessChange={(next) => handleStyleChange({ strokeWidth: next })}
        />
      );
    }

    return nodes;
  };
  return (
    <StyleSelectorWrapper>
      <header>
        <h4>Styles</h4>
        <Pen color={style?.fill || style?.stroke || 'grey'} />
      </header>
      <main>{renderStyles()}</main>
    </StyleSelectorWrapper>
  );
};

export default StyleSelector;
