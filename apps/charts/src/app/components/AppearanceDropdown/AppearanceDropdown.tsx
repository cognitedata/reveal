import { trackUsage } from '@charts-app/services/metrics';
import { availableColors } from '@charts-app/utils/colors';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Interpolation, LineStyle } from '@cognite/charts-lib';
import { Menu, Flex } from '@cognite/cogs.js';

import {
  DropdownWrapper,
  MenuWrapper,
  PreviewContainer,
  ColorPreview,
  WeightLine,
  TypeLine,
  StyledMenu,
} from './elements';
import { InterpolationStepIcon, InterpolationLinearIcon } from './Icons';

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
    <StyledMenu>
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
    </StyledMenu>
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
  iconImage,
  label,
}: {
  iconImage: any;
  label: string;
}) => {
  const SvgIcon = iconImage;
  return (
    <PreviewContainer
      style={{ display: 'flex', alignItems: 'center', marginRight: 15 }}
    >
      <SvgIcon
        src={iconImage}
        style={{ transform: `scale(1.37)` }}
        alt={label}
      />
    </PreviewContainer>
  );
};

export const ColorDropdown = ({
  selectedColor,
  onColorSelected,
  label = 'Color',
  showLabel = true,
}: {
  selectedColor: string;
  onColorSelected: (color: string) => void;
  label: string;
  showLabel?: boolean;
}) => {
  return (
    <MenuWrapper>
      {showLabel ? <Menu.Header>{label}</Menu.Header> : ''}
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
          <Flex>
            <ColorPreview color={color} />
            {color}
          </Flex>
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

const WeightDropdown = ({
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
          <Flex>
            <WeightPreview weight={weight} />
            {weight}px
          </Flex>
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

const TypeDropdown = ({
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
          <Flex>
            <TypePreview type={style} />
            {style}
          </Flex>
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

const InterpolationDropdown = ({
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
    image: any;
  }[] = [
    {
      value: 'linear',
      label: 'linear',
      image: InterpolationLinearIcon,
    },
    { value: 'hv', label: 'step', image: InterpolationStepIcon },
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
          <Flex>
            <InterpolationPreview label={label} iconImage={image} />
            {label}
          </Flex>
        </Menu.Item>
      ))}
    </MenuWrapper>
  );
};

export default AppearanceDropdown;
