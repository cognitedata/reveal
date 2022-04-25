import { AllIconTypes, Col, Icon, Row } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { ModelTypeIconMap, ModelTypeStyleMap } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationPreview } from 'src/modules/Common/types';
import { AnnotationActionMenu } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenu';

export const AnnotationsListPreview = ({
  annotations,
  reviewDisabled,
  handleReview,
  onAnnotationDeleteClick,
}: {
  annotations: AnnotationPreview[];
  reviewDisabled: boolean;
  handleReview: () => void;
  onAnnotationDeleteClick: (annotationId: number) => void;
}) => {
  const annotationsAvailable = annotations.length > 0;

  return (
    <AnnotationContainer>
      {annotationsAvailable &&
        annotations.map((annotation) => {
          return (
            <Row cols={10} key={annotation.id}>
              <StyledCol span={2}>
                <Icon
                  type={
                    annotation.text === 'person'
                      ? 'Personrounded'
                      : (ModelTypeIconMap[annotation.modelType] as AllIconTypes)
                  }
                  style={{
                    color:
                      annotation.text === 'person'
                        ? '#1AA3C1'
                        : ModelTypeStyleMap[annotation.modelType].color,
                  }}
                />
              </StyledCol>
              <StyledCol span={7}>
                <AnnotationLbl>{annotation.text}</AnnotationLbl>
              </StyledCol>
              <StyledCol span={1}>
                <AnnotationActionMenu
                  disabled={reviewDisabled}
                  handleReview={handleReview}
                  handleAnnotationDelete={() => {
                    onAnnotationDeleteClick(annotation.id);
                  }}
                />
              </StyledCol>
            </Row>
          );
        })}
      {!annotationsAvailable && (
        <EmptyPlaceHolderContainer>
          <span>No annotations</span>
        </EmptyPlaceHolderContainer>
      )}
    </AnnotationContainer>
  );
};

const AnnotationContainer = styled.div`
  width: 100%;
  display: grid;
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  height: fit-content;
  min-height: 36px;
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnnotationLbl = styled.div`
  width: 100%;
  padding: 10px 10px;
  box-sizing: content-box;
`;

const EmptyPlaceHolderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
