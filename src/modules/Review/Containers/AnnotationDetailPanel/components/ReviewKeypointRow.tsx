import React from 'react';
import styled from 'styled-components';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  KeyboardShortCutExpandChildSelectable,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { ReviewKeypoint } from 'src/modules/Review/types';
import { Col, Row } from '@cognite/cogs.js';

/**
 * @todo: Fix keypoint order and color
 */
const KeypointRowContent = ({
  reviewImageKeypoint,
  remaining = false,
  keypointIndex,
}: {
  reviewImageKeypoint: ReviewKeypoint;
  remaining?: boolean;
  keypointIndex?: number;
}) => (
  <StyledRow cols={12}>
    <StyledCol span={1}>
      <ColorBox
        // color={remaining ? '#F5F5F5' : (keypoint as KeypointVertex).color}
        color="red"
      />
    </StyledCol>
    <StyledCol span={1}>
      <div style={{ color: remaining ? '#8C8C8C' : undefined }}>
        {keypointIndex !== undefined ? keypointIndex + 1 : ''}
      </div>
    </StyledCol>
    <StyledCol span={10} className="label">
      <AnnotationTextContainer>
        <AnnotationText style={{ color: remaining ? '#8C8C8C' : undefined }}>
          {reviewImageKeypoint.keypoint.label}
        </AnnotationText>
      </AnnotationTextContainer>
    </StyledCol>
  </StyledRow>
);

/**
 * Annotation detail Component for a row of a single keypoint
 * @param additionalData
 * @constructor
 */

export const ReviewKeypointRow = ({
  additionalData,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<ReviewKeypoint>
>) => {
  const {
    common: { index },
    callbacks: { onKeypointSelect },
    ...keypoint
  } = additionalData;

  return (
    <KeyboardShortCutSelectable id={keypoint.id} selected={keypoint.selected}>
      <KeyboardShortCutExpandChildSelectable
        id={keypoint.id}
        selected={keypoint.selected}
        key={additionalData.id}
      >
        <SidePanelRow>
          <CollapseRowContainer
            onClick={() => {
              if (onKeypointSelect) {
                onKeypointSelect(keypoint.id);
              }
            }}
          >
            <KeypointRowContent
              reviewImageKeypoint={keypoint}
              keypointIndex={index}
            />
          </CollapseRowContainer>
        </SidePanelRow>
      </KeyboardShortCutExpandChildSelectable>
    </KeyboardShortCutSelectable>
  );
};

const AnnotationTextContainer = styled.div`
  padding: 7px;
  box-sizing: content-box;
`;

const AnnotationText = styled.div`
  padding: 0 10px;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
  border: 0.5px solid rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  border-radius: 2px;
`;

const StyledRow = styled(Row)`
  width: 100%;
  padding-left: 5px;
  padding-right: 5px;
  gap: 8px !important;
`;

const StyledCol = styled(Col)`
  align-self: center;
  justify-self: center;

  &.label {
    align-self: center;
    justify-self: self-start;
  }
`;

const CollapseRowContainer = styled.div`
  padding: 0 30px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;
