import { Detail } from '@cognite/cogs.js';
import React from 'react';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { VisionReviewAnnotation } from 'src/modules/Review/store/review/types';

import styled from 'styled-components';

/**
 * @todo: Fix attributes [VIS-868]
 */
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

      {/**
       *  {Object.entries(reviewAnnotation.data?.attributes || []).map(
        ([key, value]) => (
          <StyledDetail>
            {key}: {value.value}
          </StyledDetail>
        )
      )} */}
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
