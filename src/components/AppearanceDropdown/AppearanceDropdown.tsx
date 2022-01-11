import { Menu } from '@cognite/cogs.js';
import { availableColors } from 'utils/colors';
import { trackUsage } from 'services/metrics';

import {
  DropdownWrapper,
  MenuWrapper,
  PreviewContainer,
  ColorPreview,
  WeightLine,
  TypeLine,
} from './elements';

export type LineStyle = 'none' | 'solid' | 'dashed' | 'dotted';

export type AppearanceDropdownProps = {
  onUpdate: (diff: any) => void;
};

export const AppearanceDropdown = ({ onUpdate }: AppearanceDropdownProps) => {
  return (
    <Menu style={{ maxWidth: 330 }}>
      <DropdownWrapper>
        <ColorDropdown
          onColorSelected={(newColor) => {
            onUpdate({
              color: newColor,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'color' });
          }}
        />
        <WeightDropdown
          onWeightSelected={(newWeight) => {
            onUpdate({
              lineWeight: newWeight,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'line-weight' });
          }}
        />
        <TypeDropdown
          onStyleSelected={(newStyle) => {
            onUpdate({
              displayMode: newStyle === 'none' ? 'markers' : 'lines',
              lineStyle: newStyle,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'line-style' });
          }}
        />
      </DropdownWrapper>
    </Menu>
  );
};

export const ColorDropdown = ({
  onColorSelected,
}: {
  onColorSelected: (color: string) => void;
}) => {
  return (
    <MenuWrapper>
      <Menu.Header>Color</Menu.Header>
      {availableColors.map((color) => (
        <Menu.Item key={color} onClick={() => onColorSelected(color)}>
          <ColorPreview color={color} />
          {color}
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export const WeightDropdown = ({
  onWeightSelected,
}: {
  onWeightSelected: (weight: number) => void;
}) => {
  const weightOptions = [1, 2, 3, 4, 5];

  return (
    <MenuWrapper>
      <Menu.Header>Weight</Menu.Header>
      {weightOptions.map((weight) => (
        <Menu.Item
          key={weight.toString()}
          onClick={() => onWeightSelected(weight)}
        >
          <WeightPreview weight={weight} />
          {weight}px
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export const TypeDropdown = ({
  onStyleSelected,
}: {
  onStyleSelected: (style: LineStyle) => void;
}) => {
  const styleOptions: LineStyle[] = ['solid', 'dashed', 'dotted', 'none'];

  return (
    <MenuWrapper>
      <Menu.Header>Type</Menu.Header>
      {styleOptions.map((style) => (
        <Menu.Item key={style} onClick={() => onStyleSelected(style)}>
          <TypePreview type={style} />
          {style}
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

const WeightPreview = ({ weight }: { weight: number }) => (
  <PreviewContainer>
    <WeightLine weight={weight} />
  </PreviewContainer>
);

const TypePreview = ({ type }: { type: string }) => (
  <PreviewContainer style={{ marginRight: 15 }}>
    <TypeLine type={type} />
  </PreviewContainer>
);
