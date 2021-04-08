import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/pages/Preview/components/AnnotationsTable/AnnotationsTable';
import {
  selectAnnotationsByFileIdModelTypes,
  setImagePreviewEditState,
  showAnnotationDrawer,
} from 'src/store/previewSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { RootState } from 'src/store/rootReducer';
import { DetectionModelType } from 'src/api/types';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';

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

export const Contextualization = ({ fileId }: { fileId: string }) => {
  const dispatch = useDispatch();

  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotations
  );

  const tagAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
      DetectionModelType.Tag,
    ])
  );

  const gdprAndTextAndObjectAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
        DetectionModelType.Text,
        DetectionModelType.GDPR,
      ])
  );

  const editMode = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Modifiable
  );

  const handleAddAnnotation = () => {
    dispatch(showAnnotationDrawer(AnnotationDrawerMode.AddAnnotation));
  };

  const handleLinkAsset = () => {
    dispatch(showAnnotationDrawer(AnnotationDrawerMode.LinkAsset));
  };

  const handleEditPolygon = () => {
    if (editMode) {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
    } else {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.Modifiable));
    }
  };

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
      {/*        { value: 'v1', label: 'ML Corrosion v1' }, */}
      {/*        { value: 'v2', label: 'ML Corrosion v2' }, */}
      {/*      ]} */}
      {/*    /> */}
      {/*  </SelectContainer> */}
      {/*  <Button type="tertiary" type="secondary" icon="Scan"> */}
      {/*    Detect Annotations */}
      {/*  </Button> */}
      {/* </ModelSelectContainer> */}
      <EditContainer>
        <StyledButton type="primary" icon="Edit" onClick={handleAddAnnotation}>
          Add Annotations
        </StyledButton>
        {editMode ? (
          <StyledButton
            type="secondary"
            icon="Upload"
            onClick={handleEditPolygon}
          >
            Finish Editing
          </StyledButton>
        ) : (
          <StyledButton
            type="secondary"
            icon="Polygon"
            disabled={
              gdprAndTextAndObjectAnnotations.length + tagAnnotations.length ===
              0
            }
            onClick={handleEditPolygon}
          >
            Edit polygon
          </StyledButton>
        )}
        <StyledButton type="secondary" icon="Plus" onClick={handleLinkAsset}>
          Link to asset
        </StyledButton>
      </EditContainer>
      <TableContainer>
        <AnnotationsTable
          annotations={tagAnnotations}
          selectedAnnotationIds={selectedAnnotationIds.asset}
          mode={DetectionModelType.Tag}
        />
        <AnnotationsTable
          annotations={gdprAndTextAndObjectAnnotations}
          selectedAnnotationIds={selectedAnnotationIds.other}
          mode={DetectionModelType.Text}
        />
      </TableContainer>
    </Container>
  );
};

const EditContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

const TableContainer = styled.div`
  padding-top: 25px;
  overflow-y: auto;
`;
