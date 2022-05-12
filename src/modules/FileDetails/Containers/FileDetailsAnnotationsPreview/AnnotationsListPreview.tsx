/* eslint-disable no-nested-ternary */
import { AllIconTypes, Col, Icon, Row } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationActionMenu } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenu';

import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotationTypeIconMap,
  AnnotationTypeStyleMap,
} from 'src/utils/visionAnnotationUtils';

export const AnnotationsListPreview = ({
  annotations,
  reviewDisabled,
  handleReview,
  onAnnotationDeleteClick,
}: {
  annotations: VisionAnnotation<VisionAnnotationDataType>[];
  reviewDisabled: boolean;
  handleReview: () => void;
  onAnnotationDeleteClick: (annotationId: number) => void;
}) => {
  const annotationsAvailable = annotations.length > 0;

  return (
    <AnnotationContainer>
      {annotationsAvailable &&
        annotations.map((annotation) => {
          const text = getAnnotationLabelOrText(annotation);

          return (
            <Row cols={10} key={annotation.id}>
              <StyledCol span={2}>
                <Icon
                  type={
                    text === 'person'
                      ? 'Personrounded'
                      : (AnnotationTypeIconMap[
                          annotation.annotationType
                        ] as AllIconTypes)
                  }
                  style={{
                    color:
                      text === 'person'
                        ? '#1AA3C1'
                        : AnnotationTypeStyleMap[annotation.annotationType]
                            .color,
                  }}
                />
              </StyledCol>
              <StyledCol span={7}>
                <AnnotationLbl>{text}</AnnotationLbl>
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
