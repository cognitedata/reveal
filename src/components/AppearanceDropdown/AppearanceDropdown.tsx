import { Menu } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components/macro';
import { availableColors } from 'utils/colors';
import { trackUsage } from 'utils/metrics';

type LineStyle = 'none' | 'solid' | 'dashed' | 'dotted';

export const AppearanceDropdown = ({
  update,
}: {
  update: (diff: any) => void;
}) => {
  return (
    <DropdownWrapper>
      <ColorDropdown
        onColorSelected={(newColor) => {
          update({
            color: newColor,
          });
          trackUsage('ChartView.ChangeAppearance', { type: 'color' });
        }}
      />
      <WeightDropdown
        onWeightSelected={(newWeight) => {
          update({
            lineWeight: newWeight,
          });
          trackUsage('ChartView.ChangeAppearance', { type: 'line-weight' });
        }}
      />
      <TypeDropdown
        onStyleSelected={(newStyle) => {
          update({
            displayMode: newStyle === 'none' ? 'markers' : 'lines',
            lineStyle: newStyle,
          });
          trackUsage('ChartView.ChangeAppearance', { type: 'line-style' });
        }}
      />
    </DropdownWrapper>
  );
};

export const ColorDropdown = ({
  onColorSelected,
}: {
  onColorSelected: (color: string) => void;
}) => {
  return (
    <DropdownMenu>
      <Menu.Header>Color</Menu.Header>
      {availableColors.map((color) => (
        <Menu.Item key={color} onClick={() => onColorSelected(color)}>
          <ColorPreview color={color} />
          {color}
        </Menu.Item>
      ))}
    </DropdownMenu>
  );
};

export const WeightDropdown = ({
  onWeightSelected,
}: {
  onWeightSelected: (weight: number) => void;
}) => {
  const weightOptions = [1, 2, 3, 4, 5];

  return (
    <Menu>
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
    </Menu>
  );
};

export const TypeDropdown = ({
  onStyleSelected,
}: {
  onStyleSelected: (style: LineStyle) => void;
}) => {
  const styleOptions: LineStyle[] = ['solid', 'dashed', 'dotted', 'none'];

  return (
    <Menu>
      <Menu.Header>Type</Menu.Header>
      {styleOptions.map((style) => (
        <Menu.Item key={style} onClick={() => onStyleSelected(style)}>
          <TypePreview type={style} />
          {style}
        </Menu.Item>
      ))}
    </Menu>
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

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: -100px;
`;

const DropdownMenu = styled(Menu)`
  max-height: 250px;
  overflow-y: auto;
`;

const PreviewContainer = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;

const ColorPreview = styled(PreviewContainer)`
  background-color: ${(props) => props.color};
  border-radius: 2px;
`;

const WeightLine = styled.div`
  width: 10px;
  height: 10px;
  border-bottom: ${(props: { weight: number }) => props.weight}px solid black;
  position: absolute;
`;

const TypeLine = styled.div`
  width: 20px;
  height: 10px;
  border-bottom: 3px ${(props: { type: string }) => props.type} black;
  position: absolute;
`;
