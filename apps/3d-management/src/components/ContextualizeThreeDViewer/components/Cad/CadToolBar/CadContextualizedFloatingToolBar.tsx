import { type ReactElement } from 'react';

import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '@3d-management/pages/ContextualizeEditor/constants';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';
import { CogniteCadModel, DefaultNodeAppearance } from '@cognite/reveal';
import { withSuppressRevealEvents } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  ToolType,
  setTool,
  useContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';
import { deleteCdfThreeDCadContextualization } from '../../../utils/deleteCdfThreeDCadContextualization';

type CadContextualizedFloatingToolBar = {
  modelId: number;
  revisionId: number;
};

export function CadContextualizedFloatingToolBar({
  modelId,
  revisionId,
}: CadContextualizedFloatingToolBar): ReactElement {
  const sdk = useSDK();

  const {
    tool,
    viewer,
    model,
    selectedAndContextualizedNodesList,
    selectedAndContextualizedNodes,
  } = useContextualizeThreeDViewerStore((state) => ({
    tool: state.tool,
    viewer: state.threeDViewer,
    model: state.model as CogniteCadModel,
    selectedAndContextualizedNodesList:
      state.selectedAndContextualizedNodesList,
    selectedAndContextualizedNodes: state.selectedAndContextualizedNodes,
  }));

  const handleAddContextualizationToolClick = () => {
    if (tool === ToolType.ADD_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.ADD_THREEDNODE_MAPPING);
  };

  const handleDeleteContextualizationToolClick = () => {
    if (!viewer || !modelId || !model) return;

    deleteCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: selectedAndContextualizedNodesList,
    });

    // const indexSet = selectedAndContextualizedNodes.getIndexSet();
    // indexSet.clear();
    // selectedAndContextualizedNodes.updateSet(indexSet);

    model.assignStyledNodeCollection(
      selectedAndContextualizedNodes,
      DefaultNodeAppearance.Default
    );

    if (tool === ToolType.DELETE_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.DELETE_THREEDNODE_MAPPING);
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
