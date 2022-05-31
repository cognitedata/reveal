import { Detail } from '@cognite/cogs.js';
import React from 'react';
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
        <StyledDetail>
          confidence: {reviewAnnotation.annotation.confidence.toFixed(2)}
        </StyledDetail>
      )}

      {Object.entries(reviewAnnotation.annotation.attributes || []).map(
        ([key, value]) => (
          <StyledDetail>
            {key}: {value.value}
          </StyledDetail>
        )
      )}
    </AttributesContainer>
  );
};

const AttributesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDetail = styled(Detail)`
  color: white;
`;
