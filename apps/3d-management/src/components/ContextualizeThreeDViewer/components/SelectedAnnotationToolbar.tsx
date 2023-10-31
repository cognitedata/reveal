import { FC } from 'react';

import styled from 'styled-components';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { withSuppressRevealEvents } from '@cognite/reveal-react-components';

import { setTransformMode } from '../useContextualizeThreeDViewerStore';
import { TransformMode } from '../utils/createTransformControls';

import ToolTooltip from './ToolTooltip';

const LEFT = 165;
const BOTTOM = 108;
interface AnnotationBoxToolbarContentProps {
  onUpdateCdfThreeDAnnotation: (annotation) => void;
  onDeleteClicked?: () => void;
  transformMode: TransformMode | null;
}

export const SelectedAnnotationBoxToolbarContent: FC<
  AnnotationBoxToolbarContentProps
> = ({ transformMode, onUpdateCdfThreeDAnnotation, onDeleteClicked }) => {
  return (
    <Container>
      <ToolBar direction="horizontal">
        <>
          <Tooltip
            key="translate"
            content={<ToolTooltip label="Move Box" keys={['t']} />}
          >
            <Button
              icon="ResizeWidth"
              type="ghost"
              aria-label="translate box"
              toggled={transformMode === TransformMode.TRANSLATE}
              onClick={() => setTransformMode(TransformMode.TRANSLATE)}
            />
          </Tooltip>
          <Tooltip
            key="scale tooltip"
            content={<ToolTooltip label="Scale Box" keys={['g']} />}
          >
            <Button
              key="scale"
              icon="ScaleUp"
              type="ghost"
              aria-label="Scale box"
              toggled={transformMode === TransformMode.SCALE}
              onClick={() => setTransformMode(TransformMode.SCALE)}
            />
          </Tooltip>
          <Tooltip
            key="update annotation"
            content={
              <ToolTooltip label="Update Annotation Box" keys={['ENTER']} />
            }
          >
            <Button
              key="scale"
              icon="Checkmark"
              type="ghost"
              aria-label="Update annotation box"
              onClick={onUpdateCdfThreeDAnnotation}
            />
          </Tooltip>
        </>
        <Tooltip
          key="scale tooltip"
          content={<ToolTooltip label="Delete Box" keys={['DEL']} />}
        >
          <Button
            key="delete"
            icon="Delete"
            type="ghost"
            aria-label="Scale"
            onClick={onDeleteClicked}
          />
        </Tooltip>
      </ToolBar>
    </Container>
  );
};

export const SelectedAnnotationBoxToolbar = withSuppressRevealEvents(
  SelectedAnnotationBoxToolbarContent
);

const Container = styled.div`
  position: absolute;
  left: ${LEFT}px;
  bottom: ${BOTTOM}px;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 8px;
`;
