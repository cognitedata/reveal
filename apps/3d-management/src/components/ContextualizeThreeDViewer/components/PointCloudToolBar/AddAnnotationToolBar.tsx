import styled from 'styled-components';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { withSuppressRevealEvents } from '@cognite/reveal-react-components';

import {
  ToolType,
  setTransformMode,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';
import { TransformMode } from '../../utils/createTransformControls';
import { StyledInformation } from '../PointCloud/PointCloudToolBar/PointCloudToolBar';
import ToolTooltip from '../ToolTooltip';

const LEFT = 67;
const BOTTOM = 60;

export const AddAnnotationToolBar = () => {
  const { pendingAnnotation, tool, transformMode } =
    useContextualizeThreeDViewerStore((state) => ({
      pendingAnnotation: state.pendingAnnotation,
      tool: state.tool,
      transformMode: state.transformMode,
    }));

  if (tool !== ToolType.ADD_ANNOTATION) {
    return null;
  }

  if (pendingAnnotation === null) {
    return (
      <StyledInformation left={LEFT} bottom={BOTTOM}>
        Click on the model
        <br />
        to add an annotation
      </StyledInformation>
    );
  }

  return (
    <StyledAddAnnotationToolBar>
      <ToolBar direction="horizontal">
        <>
          <Tooltip
            key="translate"
            content={<ToolTooltip label="Move Box" keys={['t']} />}
          >
            <Button
              key="translate tooltip"
              icon="ResizeWidth"
              type="ghost"
              aria-label="Translate"
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
              aria-label="Scale"
              toggled={transformMode === TransformMode.SCALE}
              onClick={() => setTransformMode(TransformMode.SCALE)}
            />
          </Tooltip>
        </>
      </ToolBar>
    </StyledAddAnnotationToolBar>
  );
};

const StyledAddAnnotationToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${LEFT}px;
  bottom: ${BOTTOM}px;
`;
