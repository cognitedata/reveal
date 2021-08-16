import React, { useState } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import { Body, Button, Tooltip } from '@cognite/cogs.js';
import { NO_EMPTY_LABELS_MESSAGE } from 'src/constants/CollectionSettings';
import { Header } from './Header';
import { AnnotationCollection, Shape } from '../CollectionSettingsTypes';
import { getRandomColor } from '../utill';
import { ColorPicker } from './ColorPicker';

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

const ShapeItem = ({ shape }: { shape: Shape }) => (
  <ShapeWrapper>
    <ShapeName level={2}>{shape.ShapeName}</ShapeName>
    <ColorBoxContainer>
      <ColorBox color={shape.color} />
    </ColorBoxContainer>
  </ShapeWrapper>
);
const EditableShapeItem = ({
  shape,
  setNewShape,
  onDelete,
  onFinish,
}: {
  shape: Shape;
  setNewShape: any;
  onDelete: () => void;
  onFinish: () => void;
}) => (
  <>
    <ShapeWrapper>
      <>
        <RawInput
          onClick={handleClick}
          value={shape.ShapeName}
          placeholder="Type label"
          onChange={(event) => {
            const { value } = event.target;
            setNewShape((oldShape: any) => ({ ...oldShape, ShapeName: value }));
          }}
        />
        <ColorBoxContainer>
          <ColorPicker
            size="28px"
            color={shape.color}
            onChange={(newColor: string) => {
              setNewShape((oldShape: any) => ({
                ...oldShape,
                color: newColor,
              }));
            }}
          />
        </ColorBoxContainer>
      </>
      <Button
        icon="Delete"
        onClick={onDelete}
        size="small"
        type="ghost-danger"
        aria-label="deleteButton"
      />
    </ShapeWrapper>
    <ShapeControls>
      <Tooltip
        content={
          <span data-testid="text-content">{NO_EMPTY_LABELS_MESSAGE}</span>
        }
        disabled={shape.ShapeName !== ''}
      >
        <Button
          type="primary"
          size="small"
          icon="Checkmark"
          onClick={onFinish}
          disabled={shape.ShapeName === ''}
        >
          Finish
        </Button>
      </Tooltip>
    </ShapeControls>
  </>
);

export const Shapes = ({
  collections,
  setCollections,
}: {
  collections: AnnotationCollection;
  setCollections: React.Dispatch<React.SetStateAction<AnnotationCollection>>;
}) => {
  const { predefinedShapes } = collections;
  const [newShape, setNewShape] = useState<Shape | undefined>(undefined);

  const onFinish = () => {
    if (newShape) {
      setCollections({
        ...collections,
        predefinedShapes: [...collections.predefinedShapes, newShape],
      });
      setNewShape(undefined);
    }
  };

  return (
    <>
      <Header
        title="Shapes"
        count={predefinedShapes.length}
        onClickNew={() =>
          setNewShape({ ShapeName: '', color: getRandomColor() })
        }
      />
      <ShapePanel>
        {predefinedShapes &&
          predefinedShapes.map((shape) => (
            <ShapeItem
              shape={shape}
              key={`${shape.ShapeName}-${shape.color}`}
            />
          ))}
        {newShape && (
          <EditableShapeItem
            shape={newShape}
            setNewShape={setNewShape}
            onDelete={() => setNewShape(undefined)}
            onFinish={onFinish}
          />
        )}
      </ShapePanel>
    </>
  );
};

const ShapePanel = styled.div`
  overflow: auto;
  max-height: 500px;
`;

const ShapeWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 5px;
  padding: 12px;
  border-bottom: 1px solid #d9d9d9;
`;
const ColorBoxContainer = styled.div`
  border: 1px black solid;
  padding: 2px;
  border-radius: 4px;
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
  width: 220px;
  background: #ffffff;
`;

const ShapeControls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 5px;
  justify-content: end;
  padding: 10px;
`;
