import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { ColorPicker } from 'src/modules/Common/Components/ColorPicker/ColorPicker';
import { getRandomColor } from 'src/modules/Review/Components/AnnotationSettingsModal/utill';
import { AnnotationCollection, Shape } from 'src/modules/Review/types';
import styled from 'styled-components';
import { Body, Button, Tooltip } from '@cognite/cogs.js';
import { NO_EMPTY_LABELS_MESSAGE } from 'src/constants/AnnotationSettings';
import { renderEmptyAnnotationMessage } from 'src/modules/Review/Components/AnnotationSettingsModal/Body/EmptyAnnotationInfo';
import { Header } from './Header';

const validNewShapes = (newShapes: { [key: string]: Shape }) => {
  const shapeNames = Object.keys(newShapes).map(
    (key) => newShapes[key].shapeName
  );
  return !shapeNames.includes('');
};

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const Shapes = ({
  collections,
  setCollections,
  options,
}: {
  collections: AnnotationCollection;
  setCollections: (collection: AnnotationCollection) => void;
  options?: { createNew?: { text?: string; color?: string } };
}) => {
  const { predefinedShapes } = collections;
  const [newShapes, setNewShapes] = useState<{ [key: string]: Shape }>({});
  const shapePanelRef = useRef<HTMLDivElement | null>(null);

  const addNewShape = (newShape?: { text?: string; color?: string }) => {
    const availableIndexes = Object.keys(newShapes);
    const nextIndex = availableIndexes.length
      ? availableIndexes[availableIndexes.length - 1] + 1
      : 0;
    setNewShapes((shapes) => ({
      ...shapes,
      [`${nextIndex}`]: {
        shapeName: newShape?.text || '',
        color: newShape?.color || getRandomColor(),
      },
    }));
  };
  const updateCaption = (key: string, value: string) => {
    setNewShapes((shapes) => ({
      ...shapes,
      [key]: { ...shapes[key], shapeName: value },
    }));
  };
  const updateColor = (key: string, value: string) => {
    setNewShapes((shapes) => ({
      ...shapes,
      [key]: { ...shapes[key], color: value },
    }));
  };
  const deleteShape = (key: string) => {
    const newShapesTemp = newShapes;
    delete newShapesTemp[key];
    setNewShapes({ ...newShapesTemp });
  };
  const onFinish = () => {
    const newShapesTemp = Object.keys(newShapes).map((key) => newShapes[key]);
    setCollections({
      ...collections,
      predefinedShapes: [...collections.predefinedShapes, ...newShapesTemp],
    });
    setNewShapes({});
  };

  const scrollToBottom = () => {
    const elm = shapePanelRef.current;
    if (elm) {
      elm.scrollTop = elm.scrollHeight - elm.clientHeight;
    }
  };

  // create new keypoint on settings open
  useEffect(() => {
    if (options) {
      if (options.createNew) {
        addNewShape(options.createNew);
        scrollToBottom();
      }
    }
  }, [options]);

  useEffect(() => {
    scrollToBottom();
  }, [newShapes]);

  return (
    <>
      <Header
        title="Shapes"
        count={predefinedShapes.length}
        onClickNew={addNewShape}
        disabledMessage={
          Object.keys(newShapes).length
            ? 'Finish before creating a new one'
            : undefined
        }
      />
      <ShapePanel ref={shapePanelRef}>
        {predefinedShapes.length ? (
          predefinedShapes.map((shape) => (
            <ShapeWrapper key={`${shape.shapeName}-${shape.color}`}>
              <ShapeName level={2}>{shape.shapeName}</ShapeName>
              <ColorBox color={shape.color} />
            </ShapeWrapper>
          ))
        ) : (
          <div style={{ padding: '10px' }}>
            {!Object.keys(newShapes).length &&
              renderEmptyAnnotationMessage('shape')}
          </div>
        )}
        {Object.keys(newShapes).map((key) => (
          <ShapeWrapper key={`${key}`} style={{ background: '#4a67fb14' }}>
            <>
              <RawInput
                onClick={handleClick}
                value={newShapes[key].shapeName}
                placeholder="Create annotation"
                onChange={(event) => {
                  const { value } = event.target;
                  updateCaption(key, value);
                }}
              />
              <ColorPicker
                size="28px"
                color={newShapes[key].color}
                onChange={(newColor: string) => {
                  updateColor(key, newColor);
                }}
              />
            </>
            <Button
              icon="Trash"
              onClick={() => deleteShape(key)}
              size="small"
              type="ghost-danger"
              aria-label="deleteButton"
            />
          </ShapeWrapper>
        ))}
        {Object.keys(newShapes).length !== 0 && (
          <ShapeControls>
            <Tooltip
              content={
                <span data-testid="text-content">
                  {NO_EMPTY_LABELS_MESSAGE}
                </span>
              }
              disabled={validNewShapes(newShapes)}
            >
              <Button
                type="primary"
                size="small"
                icon="Checkmark"
                onClick={onFinish}
                disabled={!validNewShapes(newShapes)}
              >
                Finish
              </Button>
            </Tooltip>
          </ShapeControls>
        )}
      </ShapePanel>
    </>
  );
};

const ShapePanel = styled.div`
  overflow: auto;
  height: 500px;
`;

const ShapeWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  padding: 12px;
  border-bottom: 1px solid #d9d9d9;
`;
const ColorBox = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  background: ${(props) => props.color};
`;
const ShapeName = styled(Body)`
  width: 220px;
  padding-left: 12px;
`;
const RawInput = styled(Input)`
  width: 423px;
  background: #ffffff;
`;

const ShapeControls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 5px;
  justify-content: end;
  padding: 10px;
`;
