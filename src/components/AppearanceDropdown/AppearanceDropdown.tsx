import { Menu } from '@cognite/cogs.js';
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
    <Menu>
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

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 250px;
  overflow: hidden;
`;

const MenuWrapper = styled.div`
  max-height: 250px;
  overflow-y: auto;
  padding: 0 10px;
  border-left: 1px solid var(--cogs-border-default);

  &:first-child {
    padding: 0;
    border-left: none;
  }
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
