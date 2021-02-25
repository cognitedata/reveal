import React from 'react';
import { Button, Select, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/pages/Preview/components/AnnotationsTable/AnnotationsTable';
import { CogniteAnnotation } from 'src/utils/AnnotationUtils';

const Container = styled.div``;

const TitleRow = styled.div`
  margin-top: 15px;
  margin-bottom: 7px;
`;

const ModelSelectContainer = styled.div`
  display: none;
  grid-template-columns: auto 200px;
  column-gap: 10px;
`;

const ModelTitle = styled.p`
  display: none;
  margin-bottom: 5px;
  margin-left: 5px;
`;

const EditContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 20px 0;
`;
const SelectContainer = styled.div`
  padding-left: 5px;
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

export const Contextualization = (props: {
  annotations: CogniteAnnotation[];
}) => {
  return (
    <Container>
      <TitleRow>
        <Title level={3}>Detected Annotations</Title>
      </TitleRow>
      <ModelTitle>ML training model</ModelTitle>
      <ModelSelectContainer>
        <SelectContainer>
          <Select
            value="v1"
            placeholder
            options={[
              { value: 'v1', label: 'ML Corrossion v1' },
              { value: 'v2', label: 'ML Corrossion v2' },
            ]}
          />
        </SelectContainer>
        <Button variant="outline" type="secondary" icon="Scan">
          Detect Annotations
        </Button>
      </ModelSelectContainer>
      <EditContainer>
        <StyledButton type="primary" icon="Edit">
          Add Annotations
        </StyledButton>
        <StyledButton type="secondary" icon="Polygon">
          Edit polygon
        </StyledButton>
        <StyledButton type="secondary" icon="Delete">
          Delete
        </StyledButton>
      </EditContainer>
      <AnnotationsTable annotations={props.annotations} />
    </Container>
  );
};
