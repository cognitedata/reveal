import { KeypointVertex } from 'src/utils/AnnotationUtils';
import styled from 'styled-components';
import { Col, Row } from '@cognite/cogs.js';
import React from 'react';

export const KeypointRow = ({
  keypoint,
  remaining = false,
}: {
  keypoint: KeypointVertex;
  remaining?: boolean;
}) => (
  <StyledRow cols={12}>
    <StyledCol span={1}>
      <ColorBox
        color={remaining ? '#F5F5F5' : (keypoint as KeypointVertex).color}
      />
    </StyledCol>
    <StyledCol span={1}>
      <div style={{ color: remaining ? '#8C8C8C' : undefined }}>
        {(keypoint as KeypointVertex).order}
      </div>
    </StyledCol>
    <StyledCol span={10} className="label">
      <AnnotationTextContainer>
        <AnnotationText style={{ color: remaining ? '#8C8C8C' : undefined }}>
          {(keypoint as KeypointVertex).caption}
        </AnnotationText>
      </AnnotationTextContainer>
    </StyledCol>
  </StyledRow>
);

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
