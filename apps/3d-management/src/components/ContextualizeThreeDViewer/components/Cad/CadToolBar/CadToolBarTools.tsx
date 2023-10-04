import { type ReactElement, useCallback } from 'react';

import { ToolType } from '@3d-management/components/ContextualizeThreeDViewer/types';
import { useContextualizeThreeDViewerStoreCad } from '@3d-management/components/ContextualizeThreeDViewer/useContextualizeThreeDViewerStoreCad';
import noop from 'lodash-es/noop';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';

import { setTool } from '../../../useContextualizeThreeDViewerStoreCad';

type CadToolBarTools = {
  modelId: number;
  revisionId: number;
  onContextualizationDeletionRequest: typeof noop;
};

export function CadToolBarTools({
  modelId,
  revisionId,
  onContextualizationDeletionRequest,
}: CadToolBarTools): ReactElement {
  const { tool, threeDViewer, model } = useContextualizeThreeDViewerStoreCad(
    (state) => ({
      tool: state.tool,
      threeDViewer: state.threeDViewer,
      model: state.model,
    })
  );

  const handleAddClick = () => {
    if (tool === ToolType.ADD_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.ADD_THREEDNODE_MAPPING);
  };

  const handleDeleteClick = useCallback(async () => {
    if (!threeDViewer || !modelId || !model) return;

    onContextualizationDeletionRequest();

    if (tool === ToolType.DELETE_THREEDNODE_MAPPING) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.DELETE_THREEDNODE_MAPPING);
  }, [threeDViewer, modelId, model, onContextualizationDeletionRequest, tool]);

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
