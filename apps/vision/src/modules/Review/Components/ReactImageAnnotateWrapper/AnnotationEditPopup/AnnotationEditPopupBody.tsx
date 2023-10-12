import React from 'react';

import styled from 'styled-components';

import {
  Body,
  Col,
  Row,
  Icon,
  OptionType,
  Title,
  Button,
} from '@cognite/cogs.js';

import { VisionAutoComplete } from '../../../../Common/Components/VisionAutoComplete/VisionAutoComplete';
import { PopupUIElementContainer } from '../TitleContainer';

export type BodyContainerMode = 'point' | 'shape';

export const AnnotationEditPopupBody = ({
  isKeypointMode,
  isSavedAnnotation,
  labelOption,
  keypointLabel,
  labelOptions,
  onSelectLabel,
  onOpenAnnotationSettings,
}: {
  isKeypointMode: boolean;
  isSavedAnnotation: boolean;
  labelOption: OptionType<string>;
  keypointLabel: string;
  labelOptions?: OptionType<string>[];
  onSelectLabel: (value: Required<OptionType<string>>) => void;
  onOpenAnnotationSettings: (text?: string, color?: string) => void;
}) => {
  const renderEmptyAnnotationMessage = () => {
    return (
      <div
        style={{
          background: '#6E85FC0F',
          borderRadius: '8px',
          alignItems: 'flex-start',
          padding: '5px',
        }}
      >
        <Row cols={10}>
          <StyledCol span={1}>
            <div style={{ color: '#4A67FB' }}>
              <Icon type="InfoFilled" />
            </div>
          </StyledCol>

          <StyledCol span={9}>
            <Title level={5}>No existing annotations</Title>
            <Body
              level={2}
              style={{ paddingBottom: '15px', paddingTop: '8px' }}
            >
              Create a pre-defined list of annotations in Annotation Settings
            </Body>
            <Button type="tertiary" onClick={() => onOpenAnnotationSettings()}>
              Create annotations
            </Button>
          </StyledCol>
        </Row>
      </div>
    );
  };

  if (isKeypointMode) {
    if (isSavedAnnotation) {
      return (
        <>
          <Col span={2}>
            <PopupUIElementContainer title="Collection">
              {labelOption.label}
            </PopupUIElementContainer>
          </Col>
          <Col span={3}>
            <PopupUIElementContainer title="Annotation">
              {keypointLabel}
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    if (labelOptions && labelOptions.length) {
      return (
        <>
          <Col span={5}>
            <PopupUIElementContainer title="Collection">
              <VisionAutoComplete
                value={labelOption}
                options={labelOptions}
                onChange={onSelectLabel}
                placeholder="Select Keypoint"
                maxHeight={150}
                onClickCreateNew={onOpenAnnotationSettings}
              />
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    return <Col span={5}>{renderEmptyAnnotationMessage()}</Col>;
  }
  if (labelOptions && labelOptions.length) {
    return (
      <>
        <Col span={5}>
          <PopupUIElementContainer title="Label">
            <VisionAutoComplete
              value={labelOption}
              options={labelOptions}
              onChange={onSelectLabel}
              placeholder="Select Shape"
              maxHeight={150}
              onClickCreateNew={onOpenAnnotationSettings}
            />
          </PopupUIElementContainer>
        </Col>
      </>
    );
  }
  return <Col span={5}>{renderEmptyAnnotationMessage()}</Col>;
};

const StyledCol = styled(Col)`
  padding: 5px 5px 5px 14px;
`;
