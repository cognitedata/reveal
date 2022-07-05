import { useCallback, useEffect, useState } from 'react';
import { CogniteOrnate, MoveTool, RectTool, ToolType } from '@cognite/ornate';
import { Button } from '@cognite/cogs.js';
import { Annotation, DataPanelActionType, WorkspaceTool } from 'types';
import { useDataPanelContext, useWorkspaceTools } from 'hooks';

import * as Styled from './style';

type WorkspaceToolsProps = {
  ornateRef?: CogniteOrnate;
};

export const WorkspaceTools = ({ ornateRef }: WorkspaceToolsProps) => {
  const [activeTool, setActiveTool] = useState<ToolType>('move');
  const { enabledTools, onNewDetection } = useWorkspaceTools();
  const { dataPanelDispatch, dataPanelState } = useDataPanelContext();

  useEffect(() => {
    if (ornateRef) {
      const moveTool = new MoveTool(ornateRef);
      const rectTool = new RectTool(ornateRef);

      // eslint-disable-next-line no-param-reassign
      ornateRef.tools = {
        move: moveTool,
        rect: rectTool,
        default: moveTool,
      };
      onToolChange('default');
    }
  }, [ornateRef]);

  useEffect(() => {
    ornateRef?.handleToolChange(activeTool);
  }, [ornateRef, activeTool]);

  useEffect(() => {
    if (
      activeTool === 'rect' &&
      !enabledTools.includes(WorkspaceTool.RECTANGLE)
    ) {
      onToolChange('default');
    }
  }, [enabledTools]);

  useEffect(() => {
    if (dataPanelState.isActiveNewDataSource && activeTool !== 'rect') {
      setActiveTool('rect');
    } else if (!dataPanelState.isActiveNewDataSource && activeTool === 'rect') {
      setActiveTool('default');
    }
  }, [dataPanelState.isActiveNewDataSource]);

  const onToolChange = (tool: ToolType) => {
    if (tool !== activeTool) {
      setActiveTool(tool);

      dataPanelDispatch({
        type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE,
        isActive: Boolean(tool === 'rect'),
      });
    }
  };

  const onDrawingFinished = useCallback(() => {
    const rect = ornateRef?.stage.findOne('.drawing');

    if (rect && rect.parent) {
      const position = rect.getPosition();
      const size = rect.getSize();
      const parentSize = rect.parent.getSize();

      const document = ornateRef?.documents.find(
        (document) => document.group.id() === rect.parent?.id()
      );

      if (document) {
        let x = position.x / parentSize.width;
        let y = position.y / parentSize.height;
        let width = size.width / parentSize.width;
        let height = size.height / parentSize.height;

        if (width < 0) {
          x += width;
          width = Math.abs(width);
        }
        if (height < 0) {
          y += height;
          height = Math.abs(height);
        }

        const annotation: Annotation = {
          boundingBox: {
            x,
            y,
            width,
            height,
          },
          documentExternalId: document.metadata!.documentExternalId,
          pageNumber: parseInt(document.metadata!.pageNumber!, 10),
        };

        onNewDetection(annotation);
      }
    }
    onToolChange('move');
    rect?.remove();
  }, [ornateRef, onNewDetection]);

  useEffect(() => {
    if (activeTool === 'rect') {
      ornateRef?.stage.on('mouseup', onDrawingFinished);
    }

    return () => {
      ornateRef?.stage.off('mouseup', onDrawingFinished);
    };
  }, [activeTool, onDrawingFinished]);

  if (enabledTools.length === 1) return null;

  return (
    <Styled.Container>
      {enabledTools.includes(WorkspaceTool.MOVE) && (
        <Button
          type="ghost"
          size="small"
          title="Move M"
          aria-label="Move"
          icon="Grab"
          onClick={() => onToolChange('move')}
          disabled={activeTool === 'move' || activeTool === 'default'}
        />
      )}
      {enabledTools.includes(WorkspaceTool.RECTANGLE) && (
        <Button
          type="ghost"
          size="small"
          title="Add rect"
          aria-label="Add rect"
          icon="FrameTool"
          onClick={() => onToolChange('rect')}
          disabled={activeTool === 'rect'}
        />
      )}
    </Styled.Container>
  );
};
