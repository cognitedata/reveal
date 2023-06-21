import React from 'react';

import styled from 'styled-components';

import { VisionAnnotationDataType } from '@vision/modules/Common/types';
import { VisionReviewAnnotation } from '@vision/modules/Review/types';

import { Detail } from '@cognite/cogs.js';

export const AnnotationTableRowAttribute = ({
  reviewAnnotation,
}: {
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>;
}) => {
  return (
    <AttributesContainer>
      {reviewAnnotation.annotation.confidence !== undefined && (
        <Detail>
          confidence: {reviewAnnotation.annotation.confidence.toFixed(2)}
        </Detail>
      )}

      {Object.entries(reviewAnnotation.annotation.attributes || []).map(
        ([key, value]) => (
          <Detail key={key}>
            {key}: {value.value}
          </Detail>
        )
      )}
    </AttributesContainer>
  );
};

const AttributesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
