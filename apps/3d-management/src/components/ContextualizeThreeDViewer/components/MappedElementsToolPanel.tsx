import { type ReactElement, useEffect } from 'react';

import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '@3d-management/pages/ContextualizeEditor/constants';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';
import { Cognite3DViewer } from '@cognite/reveal';
import { withSuppressRevealEvents } from '@cognite/reveal-react-components';
import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import {
  ToolType,
  setTool,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';

type MappedElementsToolPanel = {
  modelId: number;
};

export function MappedElementsToolPanel({
  modelId,
}: MappedElementsToolPanel): ReactElement {
  const sdk = useSDK();

  const { tool, viewer } = useContextualizeThreeDViewerStore((state) => ({
    tool: state.tool,
    viewer: state.threeDViewer,
  }));

  const handleAddContextualizationToolClick = () => {
    if (tool === ToolType.ADD_ANNOTATION) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.ADD_ANNOTATION);
  };

  const handleDeleteContextualizationToolClick = () => {
    if (!viewer) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer,
    });

    if (pointCloudModel === undefined || tool === ToolType.DELETE_ANNOTATION) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.DELETE_ANNOTATION);
  };

  return (
    <StyledToolPanel>
      <ToolBar direction="horizontal">
        <>
          <Tooltip content="Add contextualization" position="right">
            <Button
              icon="AddLarge"
              type="ghost"
              aria-label="Add contextualization tool"
              toggled={tool === ToolType.ADD_ANNOTATION}
              onClick={handleAddContextualizationToolClick}
            />
          </Tooltip>
          <Tooltip content="Delete contextualization" position="right">
            <Button
              icon="Delete"
              type="ghost"
              aria-label="Delete contextualization tool"
              toggled={tool === ToolType.DELETE_ANNOTATION}
              onClick={handleDeleteContextualizationToolClick}
            />
          </Tooltip>
        </>
      </ToolBar>
    </StyledToolPanel>
  );
}

const StyledToolPanel = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN + 80}px;
  top: ${FLOATING_ELEMENT_MARGIN}px;
`;
