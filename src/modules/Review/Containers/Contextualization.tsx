/* eslint-disable @cognite/no-number-z-index */
import React, { useState } from 'react';
import {
  Button,
  Col,
  Detail,
  Icon,
  PrimaryTooltip,
  Row,
  Title,
  Input,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { AnnotationsTable } from 'src/modules/Review/Components/AnnotationsTable/AnnotationsTable';
import {
  editLabelAddAnnotation,
  resetPreview,
  setImagePreviewEditState,
  showAnnotationDrawer,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { useDispatch, useSelector } from 'react-redux';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { ImagePreviewEditMode } from '../../../constants/enums/VisionEnums';

type editContextType = {
  editMode: boolean;
  tagAnnotations: VisionAnnotationState[];
  gdprAndTextAndObjectAnnotations: VisionAnnotationState[];
  handleAddToFile: () => void;
  handleInEditMode: (inEditMode: boolean) => void;
};

export const EditContextualization = ({
  editMode,
  tagAnnotations,
  gdprAndTextAndObjectAnnotations,
  handleAddToFile,
  handleInEditMode,
}: editContextType) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [addAnnotationDisable, setAddAnnotationDisable] = useState(false);

  const handleAddAnnotation = () => {
    setShowMenu(true);
    handleInEditMode(true);
    dispatch(showAnnotationDrawer(AnnotationDrawerMode.AddAnnotation));
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setAddAnnotationDisable(false);
    handleInEditMode(false);
    dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
    dispatch(resetPreview());
  };

  const handleEditPolygon = () => {
    setShowMenu(false);
    if (editMode) {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
      handleInEditMode(false);
    } else {
      handleInEditMode(true);
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.Modifiable));
    }
  };

  const handleAddBoundingBox = () => {
    if (editMode) {
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.NotEditable));
    } else {
      setAddAnnotationDisable(true);
      dispatch(setImagePreviewEditState(ImagePreviewEditMode.Creatable));
    }
  };

  const drawerAnnotationLabel = useSelector(
    (state: RootState) => state.previewSlice.drawer.text || ''
  );

  const addAnnotationTextNotAvailable = useSelector(
    (state: RootState) =>
      state.previewSlice.drawer.mode === AnnotationDrawerMode.AddAnnotation &&
      !state.previewSlice.drawer.text
  );

  const hasBoundingBox = useSelector(
    (state: RootState) =>
      state.previewSlice.drawer.mode === AnnotationDrawerMode.AddAnnotation &&
      state.previewSlice.drawer.box
  );

  const inputChange = (evt: any) => {
    dispatch(editLabelAddAnnotation({ label: evt.target.value }));
  };

  const renderAnnotationOptions = () => {
    return (
      <OptionContainer>
        <Row
          cols={5}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Col span={3}>
            <Title level={4} style={{ paddingBottom: '4px' }}>
              New Annotation
            </Title>
          </Col>
          <Col span={2}>
            <Button
              icon="Close"
              type="ghost"
              size="small"
              onClick={handleCloseMenu}
            />
          </Col>
        </Row>
        <Input
          title="Annotation"
          placeholder="annotation"
          onInput={inputChange}
          value={drawerAnnotationLabel}
        />

        <Row style={{ paddingTop: '40px', paddingLeft: '45px' }} cols={5}>
          <Col span={3}>
            <Button
              icon="Polygon"
              size="small"
              onClick={handleAddBoundingBox}
              disabled={addAnnotationTextNotAvailable || addAnnotationDisable}
            >
              Add bounding box
            </Button>
          </Col>
          <Col span={2}>
            <Button
              type="primary"
              icon="Plus"
              size="small"
              onClick={() => {
                setAddAnnotationDisable(false);
                return handleAddToFile();
              }}
              disabled={addAnnotationTextNotAvailable || !hasBoundingBox}
            >
              Add to file
            </Button>
          </Col>
        </Row>
      </OptionContainer>
    );
  };

  return (
    <>
      <EditContainer>
        <StyledRow cols={5}>
          <Col span={3}>
            <StyledButton
              type={showMenu ? 'primary' : 'tertiary'}
              icon="Scan"
              variant="inverted"
              onClick={handleAddAnnotation}
            >
              Add new annotations
            </StyledButton>
          </Col>
          {editMode ? (
            <Col span={2}>
              <StyledButton
                type="primary"
                icon="Upload"
                onClick={handleEditPolygon}
                variant="inverted"
              >
                Finish Editing
              </StyledButton>
            </Col>
          ) : (
            <Col span={2}>
              <StyledButton
                type="tertiary"
                icon="Polygon"
                disabled={
                  gdprAndTextAndObjectAnnotations.length +
                    tagAnnotations.length ===
                  0
                }
                onClick={handleEditPolygon}
                variant="inverted"
              >
                Edit polygons
              </StyledButton>
            </Col>
          )}
        </StyledRow>
        <Row style={{ marginTop: '5px' }}>
          {showMenu && renderAnnotationOptions()}
        </Row>
      </EditContainer>
    </>
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

const StyledButton = styled(Button)`
  margin-left: 0;
`;

const TableContainer = styled.div`
  overflow-y: auto;
`;

const StyledRow = styled(Row)`
  justify-content: space-around;
  display: flex;
  gap: 13px !important;
`;

// NOTE: hard-coded width
const EditContainer = styled.div`
  position: absolute;
  isolation: isolate;
  max-width: 360px;
  z-index: 1;
  transform: translate(-10px, 10px);
  right: 0;
`;
const OptionContainer = styled.div`
  dipslay: flex;
  width: 360px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 11px;
`;
