import React from 'react';
import styled from 'styled-components';
import { Body, Colors, Detail } from '@cognite/cogs.js';
import {
  getExtendedAnnotationLabel,
  isSuggestedAnnotation,
} from './migration/utils';
import { ExtendedAnnotation } from './types';

type Props = {
  annotation: ExtendedAnnotation;
};

export const AnnotationHoverPreview = ({ annotation }: Props) => {
  const annotationLabel = getExtendedAnnotationLabel(annotation) || 'N/A';
  return (
    <Wrapper>
      {isSuggestedAnnotation(annotation) && <NewLabel strong>New</NewLabel>}
      <StyledBody level={2} strong>
        {annotationLabel}
      </StyledBody>
    </Wrapper>
  );
};

const StyledBody = styled(Body)`
  color: ${Colors.white.hex()} !important;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${Colors['greyscale-grey10'].hex()};
  border-radius: 6px;
  padding: 6px;
`;
const NewLabel = styled(Detail)`
  background-color: ${Colors['midblue-6'].hex()};
  color: ${Colors['midblue-2'].hex()};
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
`;
