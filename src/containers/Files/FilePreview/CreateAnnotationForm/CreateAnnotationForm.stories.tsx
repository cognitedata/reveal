import React, { useState } from 'react';
import styled from 'styled-components';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { PNID_ANNOTATION_TYPE } from 'utils/AnnotationUtils';
import { CogniteAnnotation, CURRENT_VERSION } from '@cognite/annotations';
import { v4 as uuid } from 'uuid';
import { CreateAnnotationForm } from './CreateAnnotationForm';

export default {
  title: 'Files/Annotations/CreateAnnotationForm',
  component: CreateAnnotationForm,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Default = () => {
  const [pendingAnnotation, setPendingAnnotation] = useState<
    ProposedCogniteAnnotation | CogniteAnnotation
  >({
    id: uuid(),
    status: 'verified',
    version: CURRENT_VERSION,
    source: `email:testing`,
    label: '',
    type: PNID_ANNOTATION_TYPE,
    page: 0,
    box: {
      xMin: 1,
      yMin: 1,
      xMax: 1,
      yMax: 1,
    },
  });
  return (
    <CreateAnnotationForm
      annotation={pendingAnnotation}
      updateAnnotation={setPendingAnnotation}
      onSave={() => {}}
      onDelete={() => {}}
      onLinkResource={() => {}}
    />
  );
};

const Container = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;
