import { Detail } from '@cognite/cogs.js';
import React from 'react';
import { AnnotationTableItem } from 'src/modules/Review/types';
import styled from 'styled-components';

export const AnnotationTableRowAttribute = ({
  annotation,
}: {
  annotation: AnnotationTableItem;
}) => {
  return (
    <AttributesContainer>
      <StyledDetail>
        confidence:{' '}
        {annotation.data?.confidence
          ? annotation.data.confidence.toFixed(2)
          : '-'}
      </StyledDetail>

      {Object.entries(annotation.data?.attributes || []).map(([key, value]) => (
        <StyledDetail>
          {key}: {value.value}
        </StyledDetail>
      ))}
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
