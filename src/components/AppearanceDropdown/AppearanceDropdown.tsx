/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { Menu } from '@cognite/cogs.js';
import { availableColors } from 'utils/colors';
import { trackUsage } from 'services/metrics';

import { makeDefaultTranslations } from 'utils/translations';
import { Interpolation, LineStyle } from 'models/chart/types';
import {
  DropdownWrapper,
  MenuWrapper,
  PreviewContainer,
  ColorPreview,
  WeightLine,
  TypeLine,
} from './elements';

import interpolationLinearIcon from '../../assets/Linear.svg';
import interpolationStepIcon from '../../assets/Step.svg';

type AppearanceDropdownProps = {
  selectedColor: string;
  selectedLineStyle: string;
  selectedLineWeight: number;
  selectedInterpolation: string;
  onUpdate: (diff: any) => void;
  translations: typeof defaultTranslation;
};

const defaultTranslation = makeDefaultTranslations(
  'Color',
  'Weight',
  'Type',
  'Interpolation'
);

const AppearanceDropdown = ({
  selectedColor,
  selectedLineStyle,
  selectedLineWeight,
  selectedInterpolation,
  translations,
  onUpdate,
}: AppearanceDropdownProps) => {
  const t = { ...defaultTranslation, ...translations };
  return (
    <Menu style={{ maxWidth: 600 }}>
      <DropdownWrapper>
        <ColorDropdown
          label={t.Color}
          selectedColor={selectedColor}
          onColorSelected={(newColor) => {
            onUpdate({
              color: newColor,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'color' });
          }}
        />
        <WeightDropdown
          label={t.Weight}
          selectedWeight={selectedLineWeight}
          onWeightSelected={(newWeight) => {
            onUpdate({
              lineWeight: newWeight,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'line-weight' });
          }}
        />
        <TypeDropdown
          label={t.Type}
          selectedType={selectedLineStyle}
          onStyleSelected={(newStyle) => {
            onUpdate({
              displayMode: newStyle === 'none' ? 'markers' : 'lines',
              lineStyle: newStyle,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'line-style' });
          }}
        />
        <InterpolationDropdown
          label={t.Interpolation}
          selectedInterpolation={selectedInterpolation}
          onInterpolationSelected={(newInterpolation) => {
            onUpdate({
              interpolation: newInterpolation,
            });
            trackUsage('ChartView.ChangeAppearance', { type: 'interpolation' });
          }}
        />
      </DropdownWrapper>
    </Menu>
  );
};

AppearanceDropdown.translationKeys = Object.keys(defaultTranslation);

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

const InterpolationPreview = ({
  image,
  label,
}: {
  image: string;
  label: string;
}) => (
  <PreviewContainer
    style={{ display: 'flex', alignItems: 'center', marginRight: 15 }}
  >
    <img style={{ width: 22, height: 22 }} src={image} alt={label} />
  </PreviewContainer>
);

export const ColorDropdown = ({
  selectedColor,
  onColorSelected,
  label = 'Color',
}: {
  selectedColor: string;
  onColorSelected: (color: string) => void;
  label: string;
}) => {
  return (
    <MenuWrapper>
      <Menu.Header>{label}</Menu.Header>
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
  label = 'Weight',
}: {
  selectedWeight: number;
  onWeightSelected: (weight: number) => void;
  label: string;
}) => {
  const weightOptions = [1, 2, 3, 4, 5];

  return (
    <MenuWrapper>
      <Menu.Header>{label}</Menu.Header>
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
  label = 'Type',
}: {
  selectedType: string;
  onStyleSelected: (style: LineStyle) => void;
  label: string;
}) => {
  const styleOptions: LineStyle[] = ['solid', 'dashed', 'dotted', 'none'];

  return (
    <MenuWrapper>
      <Menu.Header>{label}</Menu.Header>
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

export const InterpolationDropdown = ({
  selectedInterpolation,
  onInterpolationSelected,
  label: headerLabel = 'Interpolation',
}: {
  selectedInterpolation: string;
  onInterpolationSelected: (interpolation: Interpolation) => void;
  label: string;
}) => {
  const interpolationOptions: {
    value: Interpolation;
    label: string;
    image: string;
  }[] = [
    { value: 'linear', label: 'linear', image: interpolationLinearIcon },
    { value: 'hv', label: 'step', image: interpolationStepIcon },
  ];

  return (
    <MenuWrapper>
      <Menu.Header>{headerLabel}</Menu.Header>
      {interpolationOptions.map(({ value, label, image }) => (
        <Menu.Item
          key={value}
          onClick={() => onInterpolationSelected(value)}
          style={
            selectedInterpolation === value
              ? {
                  color: 'var(--cogs-midblue-3)',
                  backgroundColor: 'var(--cogs-midblue-6)',
                }
              : {}
          }
        >
          <InterpolationPreview label={label} image={image} />
          {label}
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export default AppearanceDropdown;
