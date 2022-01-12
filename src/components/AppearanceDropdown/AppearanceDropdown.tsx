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
  selectedColor: string;
  selectedLineStyle: string;
  selectedLineWeight: number;
  onUpdate: (diff: any) => void;
};

export const AppearanceDropdown = ({
  selectedColor,
  selectedLineStyle,
  selectedLineWeight,
  onUpdate,
}: AppearanceDropdownProps) => {
  return (
    <Menu style={{ maxWidth: 330 }}>
      <DropdownWrapper>
        <ColorDropdown
          selectedColor={selectedColor}
          onColorSelected={(newColor) => {
            onUpdate({
              color: newColor,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'color' });
          }}
        />
        <WeightDropdown
          selectedWeight={selectedLineWeight}
          onWeightSelected={(newWeight) => {
            onUpdate({
              lineWeight: newWeight,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'line-weight' });
          }}
        />
        <TypeDropdown
          selectedType={selectedLineStyle}
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
  selectedColor,
  onColorSelected,
}: {
  selectedColor: string;
  onColorSelected: (color: string) => void;
}) => {
  return (
    <MenuWrapper>
      <Menu.Header>Color</Menu.Header>
      {availableColors.map((color) => (
        <Menu.Item
          key={color}
          onClick={() => onColorSelected(color)}
          style={
            selectedColor === color
              ? {
                  color: 'var(--cogs-midblue-3)',
                  backgroundColor: 'var(--cogs-midblue-6)',
                }
              : {}
          }
        >
          <ColorPreview color={color} />
          {color}
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export const WeightDropdown = ({
  selectedWeight,
  onWeightSelected,
}: {
  selectedWeight: number;
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
          style={
            selectedWeight === weight
              ? {
                  color: 'var(--cogs-midblue-3)',
                  backgroundColor: 'var(--cogs-midblue-6)',
                }
              : {}
          }
        >
          <WeightPreview weight={weight} />
          {weight}px
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export const TypeDropdown = ({
  selectedType,
  onStyleSelected,
}: {
  selectedType: string;
  onStyleSelected: (style: LineStyle) => void;
}) => {
  const styleOptions: LineStyle[] = ['solid', 'dashed', 'dotted', 'none'];

  return (
    <MenuWrapper>
      <Menu.Header>Type</Menu.Header>
      {styleOptions.map((style) => (
        <Menu.Item
          key={style}
          onClick={() => onStyleSelected(style)}
          style={
            selectedType === style
              ? {
                  color: 'var(--cogs-midblue-3)',
                  backgroundColor: 'var(--cogs-midblue-6)',
                }
              : {}
          }
        >
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
