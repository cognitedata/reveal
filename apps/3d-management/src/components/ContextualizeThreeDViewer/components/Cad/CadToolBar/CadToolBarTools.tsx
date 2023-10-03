import { type ReactElement } from 'react';

import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '@3d-management/pages/ContextualizeEditor/constants';
import noop from 'lodash-es/noop';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import {
  ToolType,
  setTool,
  useContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';
import { deleteCdfThreeDCadContextualization } from '../../../utils/deleteCdfThreeDCadContextualization';

type CadToolBarTools = {
  modelId: number;
  revisionId: number;
  onContextualizationDeleted: typeof noop;
};

export function CadToolBarTools({
  modelId,
  revisionId,
  onContextualizationDeleted,
}: CadToolBarTools): ReactElement {
  const sdk = useSDK();

  const { tool, threeDViewer, model } =
    useContextualizeThreeDViewerStore.getState();

  const handleAddClick = () => {
    if (tool === ToolType.ADD_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.ADD_THREEDNODE_MAPPING);
  };

  const handleDeleteClick = async () => {
    if (!threeDViewer || !modelId || !model) return;

    const { selectedAndContextualizedNodesList } =
      useContextualizeThreeDViewerStore.getState();

    const nodeIds = selectedAndContextualizedNodesList.map(
      (item) => item.nodeId
    );
    const mappedNodesDeleted = await deleteCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: nodeIds,
    });

    onContextualizationDeleted(mappedNodesDeleted);

    if (tool === ToolType.DELETE_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.DELETE_THREEDNODE_MAPPING);
  };

  return (
    <ToolBar direction="vertical">
      <>
        <Tooltip content="Add contextualization" position="right">
          <Button
            icon="AddLarge"
            type="ghost"
            aria-label="Add contextualization tool"
            toggled={tool === ToolType.ADD_ANNOTATION}
            onClick={handleAddClick}
          />
        </Tooltip>
        <Tooltip content="Delete contextualization" position="right">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Delete contextualization tool"
            toggled={tool === ToolType.DELETE_ANNOTATION}
            onClick={handleDeleteClick}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
}
