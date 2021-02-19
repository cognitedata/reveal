import { Menu } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components/macro';
import { availableColors } from 'utils/colors';

export const AppearanceDropdown = ({
  onColorSelected,
  onWeightSelected,
  onStyleSelected,
}: {
  onColorSelected: (color: string) => void;
  onWeightSelected: (weight: number) => void;
  onStyleSelected: (style: 'solid' | 'dashed' | 'dotted') => void;
}) => {
  return (
    <DropdownWrapper>
      <ColorDropdown onColorSelected={onColorSelected} />
      <WeightDropdown onWeightSelected={onWeightSelected} />
      <TypeDropdown onStyleSelected={onStyleSelected} />
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
        <Menu.Item onClick={() => onColorSelected(color)}>
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
        <Menu.Item onClick={() => onWeightSelected(weight)}>
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
  onStyleSelected: (style: 'solid' | 'dashed' | 'dotted') => void;
}) => {
  const styleOptions = ['solid', 'dashed', 'dotted'];

  return (
    <Menu>
      <Menu.Header>Type</Menu.Header>
      {styleOptions.map((style) => (
        <Menu.Item
          onClick={() =>
            onStyleSelected(style as 'solid' | 'dashed' | 'dotted')
          }
        >
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

const DropdownWrapper = styled(Menu)`
  display: flex;
  flex-direction: row;
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
