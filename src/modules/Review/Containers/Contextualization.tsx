/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Button, Icon, PrimaryTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import {
  setImagePreviewEditState,
  showAnnotationDrawer,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

type editContextType = {
  editMode: boolean;
  tagAnnotations: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations: VisionAnnotationState[];
};

export const EditContextualization = ({
  editMode,
  tagAnnotations,
  gdprAndTextAndObjectAnnotations,
}: editContextType) => {
  const dispatch = useDispatch();
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
            gdprAndTextAndObjectAnnotations.length + tagAnnotations.length === 0
          }
          onClick={handleEditPolygon}
        >
          Edit polygon
        </StyledButton>
      )}
      <StyledButton
        type="secondary"
        icon="ResourceAssets"
        onClick={handleLinkAsset}
      >
        Link to asset
      </StyledButton>
    </EditContainer>
  );
};

export const Contextualization = (props: {
  tagAnnotations?: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations?: VisionAnnotationState[];
  file: FileInfo;
}) => {
  const { file, tagAnnotations, gdprAndTextAndObjectAnnotations } = props;
  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotations
  );

  return (
    <Container>
      <TitleRow>
        <NewTitle>{file?.name}</NewTitle>
      </TitleRow>
      <div style={{ fontStyle: 'italic' }}>
        {'Labeling detected annotations '}
        <PrimaryTooltip
          tooltipTitle="Labeling annotations"
          tooltipText={`
              Pressing True or False will label the predictions in order to improve the 
              future quality of the annotation detection. Pressing False will not delete the annotation.
              `}
        >
          <Icon type="Help" />
        </PrimaryTooltip>
      </div>

      <TableContainer>
        {tagAnnotations && (
          <AnnotationsTable
            annotations={tagAnnotations}
            selectedAnnotationIds={selectedAnnotationIds.asset}
            mode={VisionAPIType.TagDetection}
          />
        )}
        {gdprAndTextAndObjectAnnotations && (
          <AnnotationsTable
            annotations={gdprAndTextAndObjectAnnotations}
            selectedAnnotationIds={selectedAnnotationIds.other}
            mode={VisionAPIType.ObjectDetection} // TODO: only used to check if it is a tagdetection (?), refactor
          />
        )}
      </TableContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-row-gap: 15px;
  grid-template-rows: auto auto calc(100% - 113px);
  padding-top: 15px;
  box-sizing: border-box;
`;

// Todo: 290px hardcoded
const NewTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 290px;
`;

const TitleRow = styled.div`
  display: flex;
  flex: 0 5 auto;
`;

const EditContainer = styled.div`
  position: absolute;
  isolation: isolate;
  z-index: 1;
  transform: translate(120px, 8px);
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

const TableContainer = styled.div`
  padding-top: 25px;
  overflow-y: auto;
`;
