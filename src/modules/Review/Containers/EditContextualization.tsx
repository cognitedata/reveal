import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import {
  resetPreview,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import { Button, Col, Input, Row, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

const EditContainer = styled.div`
  position: absolute;
  isolation: isolate;
  max-width: 360px;
  transform: translate(-10px, 10px);
  right: 0;
`;
const OptionContainer = styled.div`
  display: flex;
  width: 360px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 11px;
`;

const StyledButton = styled(Button)`
  margin-left: 0;
`;

const StyledRow = styled(Row)`
  justify-content: space-around;
  display: flex;
  gap: 13px !important;
`;

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
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setAddAnnotationDisable(false);
    handleInEditMode(false);
    dispatch(resetPreview());
  };

  const handleEditPolygon = () => {
    setShowMenu(false);
    if (editMode) {
      handleInEditMode(false);
    } else {
      handleInEditMode(true);
    }
  };

  const handleAddBoundingBox = () => {
    if (editMode) {
      // do nothing
    } else {
      setAddAnnotationDisable(true);
    }
  };

  const drawerAnnotationLabel = '';

  const addAnnotationTextNotAvailable = false;

  const hasBoundingBox = false;

  const inputChange = () => {};

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
      {/* eslint-disable-next-line @cognite/no-number-z-index */}
      <EditContainer style={{ zIndex: 1 }}>
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
