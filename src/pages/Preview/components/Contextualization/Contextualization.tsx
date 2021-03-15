import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/pages/Preview/components/AnnotationsTable/AnnotationsTable';
import { VisionAnnotationState } from 'src/store/previewSlice';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-row-gap: 15px;
  grid-template-rows: auto auto calc(100% - 113px);
  padding-top: 15px;
  box-sizing: border-box;
`;

const TitleRow = styled.div``;

// const ModelSelectContainer = styled.div`
//   grid-template-columns: auto 200px;
//   column-gap: 10px;
// `;
//
// const ModelTitle = styled.p`
//   margin-bottom: 5px;
//   margin-left: 5px;
// `;
//
// const SelectContainer = styled.div`
//   padding-left: 5px;
// `;

const EditContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

export const Contextualization = (props: {
  annotations: VisionAnnotationState[];
}) => {
  return (
    <Container>
      <TitleRow>
        <Title level={3}>Detected Annotations</Title>
      </TitleRow>
      {/* <ModelTitle>ML training model</ModelTitle> */}
      {/* <ModelSelectContainer> */}
      {/*  <SelectContainer> */}
      {/*    <Select */}
      {/*      value="v1" */}
      {/*      placeholder */}
      {/*      options={[ */}
      {/*        { value: 'v1', label: 'ML Corrossion v1' }, */}
      {/*        { value: 'v2', label: 'ML Corrossion v2' }, */}
      {/*      ]} */}
      {/*    /> */}
      {/*  </SelectContainer> */}
      {/*  <Button variant="outline" type="secondary" icon="Scan"> */}
      {/*    Detect Annotations */}
      {/*  </Button> */}
      {/* </ModelSelectContainer> */}
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
