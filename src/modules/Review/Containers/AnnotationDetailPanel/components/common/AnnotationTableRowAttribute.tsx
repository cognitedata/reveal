import React from 'react';
import { Detail } from '@cognite/cogs.js';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { VisionReviewAnnotation } from 'src/modules/Review/types';

import styled from 'styled-components';

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
