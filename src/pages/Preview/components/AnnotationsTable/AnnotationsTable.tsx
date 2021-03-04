import { Button, Col, Input, Radio, Row } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { Divider } from '@cognite/data-exploration';
import { AnnotationUtils, CogniteAnnotation } from 'src/utils/AnnotationUtils';

const Container = styled.div`
  width: 100%;
`;
const StyledRow = styled(Row)`
  margin-bottom: 8px;
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
`;

const AnnotationLbl = styled.div`
  width: 100%;
  padding-right: 10px;
  box-sizing: content-box;
`;

const AcceptBtn = styled(Button)`
  background: #6fcf97;
`;

const RejectBtn = styled(Button)`
  margin-left: 10px;
  background: #eb5757;
`;

const ShowHideBtn = styled(Button)`
  padding: 4px;
`;

interface BadgeProps {
  backgroundColor: string;
}
const AnnotationBadge = styled.div<BadgeProps>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnnotationsTable = (props: {
  annotations: CogniteAnnotation[];
}) => {
  const { annotationColor } = AnnotationUtils;
  return (
    <Container>
      <StyledRow>
        <StyledCol span={2}> </StyledCol>
        <StyledCol span={5}>Action</StyledCol>
        <StyledCol span={12}>Annotations</StyledCol>
        <StyledCol span={5}>Polygon</StyledCol>
      </StyledRow>
      <Divider.Horizontal />
      {props.annotations.map((annotation) => {
        return (
          <StyledRow key={annotation.id}>
            <StyledCol span={2}>
              <Radio id="example7" name="example" value="Option 1" />
            </StyledCol>
            <StyledCol span={5}>
              <AcceptBtn type="primary" icon="Check" />
              <RejectBtn type="primary" icon="Close" />
            </StyledCol>
            <StyledCol span={12}>
              <AnnotationLbl>
                <Input
                  disabled
                  style={{ width: `100%` }}
                  value={annotation.description}
                />
              </AnnotationLbl>
            </StyledCol>
            <StyledCol span={5}>
              <ShowHideBtn
                type="secondary"
                variant="outline"
                icon="EyeShow"
                iconPlacement="right"
              >
                <AnnotationBadge backgroundColor={annotationColor}>
                  {annotation.id}
                </AnnotationBadge>
              </ShowHideBtn>
            </StyledCol>
          </StyledRow>
        );
      })}
    </Container>
  );
};
