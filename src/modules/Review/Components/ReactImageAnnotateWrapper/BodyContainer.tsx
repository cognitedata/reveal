import { Col, Label, OptionType, Select } from '@cognite/cogs.js';
import { PopupUIElementContainer } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/TitleContainer';
import React from 'react';
import { ColorBadge } from 'src/modules/Review/Components/ColorBadge/ColorBadge';
import styled from 'styled-components';

export type BodyContainerMode = 'point' | 'shape';

export const BodyContainer = ({
  isKeypointMode,
  color,
  isSavedAnnotation,
  labelOption,
  keypointLabel,
  labelOptions,
  onSelectLabel,
}: {
  isKeypointMode: boolean;
  color: string;
  isSavedAnnotation: boolean;
  labelOption: OptionType<string>;
  keypointLabel: string;
  labelOptions?: OptionType<string>[];
  onSelectLabel: (label: Required<OptionType<string>>) => void;
}) => {
  if (isKeypointMode) {
    if (isSavedAnnotation) {
      return (
        <>
          <Col span={2}>
            <PopupUIElementContainer title="Collection">
              <StyledLabel>{labelOption.label}</StyledLabel>
            </PopupUIElementContainer>
          </Col>
          <Col span={3}>
            <PopupUIElementContainer title="Label">
              <StyledLabel>{keypointLabel}</StyledLabel>
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    if (labelOptions && labelOptions.length) {
      return (
        <>
          <Col span={3}>
            <PopupUIElementContainer title="Collection">
              <Select
                closeMenuOnSelect
                value={labelOption}
                onChange={onSelectLabel}
                options={labelOptions}
              />
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    return (
      <Col span={5}>
        <Label variant="warning">Please create a keypoint collection</Label>
      </Col>
    );
  }
  if (labelOptions && labelOptions.length) {
    return (
      <>
        <Col span={1}>
          <PopupUIElementContainer title="Color">
            <ColorBadge color={color} />
          </PopupUIElementContainer>
        </Col>
        <Col span={4}>
          <PopupUIElementContainer title="Label">
            <Select
              closeMenuOnSelect
              value={labelOption}
              onChange={onSelectLabel}
              options={labelOptions}
            />
          </PopupUIElementContainer>
        </Col>
      </>
    );
  }
  return (
    <Col span={5}>
      <StyledLabel variant="warning">Please create a shape</StyledLabel>
    </Col>
  );
};

const StyledLabel = styled(Label)`
  width: 100%;
`;
