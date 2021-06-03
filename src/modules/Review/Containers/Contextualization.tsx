/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Button, Detail, Icon, PrimaryTooltip } from '@cognite/cogs.js';
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
      <StyledButton
        type="secondary"
        icon="Scan"
        variant="inverted"
        onClick={handleAddAnnotation}
      >
        Add new annotations
      </StyledButton>
      <StyledButton
        type="secondary"
        icon="ResourceAssets"
        onClick={handleLinkAsset}
        variant="inverted"
      >
        Create link to asset
      </StyledButton>
      {editMode ? (
        <StyledButton
          type="secondary"
          icon="Upload"
          onClick={handleEditPolygon}
          variant="inverted"
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
          variant="inverted"
        >
          Edit polygons
        </StyledButton>
      )}
    </EditContainer>
  );
};

export const Contextualization = (props: {
  tagAnnotations?: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations?: VisionAnnotationState[];
}) => {
  const { tagAnnotations, gdprAndTextAndObjectAnnotations } = props;
  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotations
  );

  return (
    <Container>
      <Detail style={{ color: '#595959' }}>
        {'Approve and reject detected annotations '}
        <PrimaryTooltip
          tooltipTitle="Labeling annotations"
          tooltipText={`
              Pressing True or False will label the predictions in order to improve the 
              future quality of the annotation detection. Pressing False will not delete the annotation.
              `}
        >
          <Icon style={{ color: '#BFBFBF' }} type="HelpFilled" />
        </PrimaryTooltip>
      </Detail>

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
  grid-template-rows: auto calc(100% - 50px) auto;
  padding-top: 15px;
  box-sizing: border-box;
`;

const EditContainer = styled.div`
  position: absolute;
  isolation: isolate;
  z-index: 1;
  transform: translate(120px, 8px);
  left: calc(100% - 680px);
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

const TableContainer = styled.div`
  overflow-y: auto;
`;
