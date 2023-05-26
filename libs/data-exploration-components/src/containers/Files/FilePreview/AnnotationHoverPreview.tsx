import React from 'react';

import styled from 'styled-components';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { Body, Colors, Detail } from '@cognite/cogs.js';

import {
  getExtendedAnnotationLabel,
  isSuggestedAnnotation,
} from './migration/utils';

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
  color: ${Colors['text-icon--on-contrast--strong']} !important;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--cogs-decorative--grayscale--1000);
  border-radius: 6px;
  padding: 6px;
`;
const NewLabel = styled(Detail)`
  background-color: var(--cogs-decorative--blue--100);
  color: var(--cogs-decorative--blue--600);
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
`;
