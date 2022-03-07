import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { AnnotationIcon } from 'components/CustomIcons';
import { WorkspaceTool } from 'components/LineReviewViewer/useWorkspaceTools';
import Konva from 'konva';
import { useState } from 'react';
import isString from 'lodash/isString';

import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

enum MenuLayer {
  OPACITY = 'opacity',
}

const SelectorsByMenuLayers: Record<MenuLayer, any> = {
  [MenuLayer.OPACITY]: (node: Konva.Node) =>
    isString(node.id()) && node.id().startsWith('opacity'),
};

type WorkSpaceToolsProps = {
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  enabledTools?: WorkspaceTool[];
  ornateRef?: CogniteOrnate;
  areKeyboardShortcutsEnabled: boolean;
};

const DEFAULT_LAYER_STYLE = {
  marginRight: 16,
  filter: '',
  opacity: 1,
};
const HIDDEN_LAYER_STYLE = {
  filter: 'grayscale(1)',
  opacity: 0.2,
};

const WorkSpaceTools = ({
  tool,
  onToolChange,
  enabledTools = [
    WorkspaceTool.LAYERS,
    WorkspaceTool.SELECT,
    WorkspaceTool.MOVE,
    WorkspaceTool.LINE,
    WorkspaceTool.RECTANGLE,
    WorkspaceTool.CIRCLE,
    WorkspaceTool.TEXT,
    WorkspaceTool.COMMENT,
  ],
  ornateRef,
  areKeyboardShortcutsEnabled,
}: WorkSpaceToolsProps) => {
  const [layerStatus, setLayerStatus] = useState<Record<MenuLayer, boolean>>({
    [MenuLayer.OPACITY]: true,
  });

  const onSetLayerVisibility = (layerModifier: MenuLayer, visible: boolean) => {
    (ornateRef?.stage.find(SelectorsByMenuLayers[layerModifier]) ?? []).forEach(
      (shape) => {
        if (visible) {
          shape.show();
        } else {
          shape.hide();
        }
      }
    );
  };

  const onToggleLayer = (layer: MenuLayer) => {
    onSetLayerVisibility(layer, !layerStatus[layer]);
    setLayerStatus((prev) => ({
      ...prev,
      [layer]: !layerStatus[layer],
    }));
  };

  return (
    <WorkSpaceToolsWrapper>
      {enabledTools.includes(WorkspaceTool.LAYERS) && (
        <>
          <Dropdown
            content={
              <Menu>
                <Menu.Header>Click to turn on / off</Menu.Header>
                <Menu.Item
                  onClick={() => onToggleLayer(MenuLayer.OPACITY)}
                  style={{
                    ...DEFAULT_LAYER_STYLE,
                    ...(layerStatus[MenuLayer.OPACITY]
                      ? HIDDEN_LAYER_STYLE
                      : {}),
                  }}
                >
                  <AnnotationIcon style={{ marginRight: 8 }} />
                  Masking
                </Menu.Item>
              </Menu>
            }
            placement="auto-end"
          >
            <Button
              type="ghost"
              size="small"
              onClick={() => onToolChange(WorkspaceTool.MOVE)}
              title="Layers"
            >
              <Icon type="Layers" />
            </Button>
          </Dropdown>

          <ToolboxSeparator />
        </>
      )}
      {enabledTools.includes(WorkspaceTool.SELECT) && (
        <Button
          type="ghost"
          size="small"
          title="Move M"
          onClick={() => onToolChange(WorkspaceTool.SELECT)}
          disabled={tool === WorkspaceTool.SELECT}
        >
          <Icon type="Cursor" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.MOVE) && (
        <Button
          type="ghost"
          size="small"
          title="Move M"
          onClick={() => onToolChange(WorkspaceTool.MOVE)}
          disabled={tool === 'move'}
        >
          <Icon type="Grab" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.LINK) && (
        <Button
          type="ghost"
          size="small"
          title="Link alt/option"
          onClick={() => onToolChange(WorkspaceTool.LINK)}
          disabled={tool === WorkspaceTool.LINK}
        >
          <Icon type="Link" />
        </Button>
      )}
      {areKeyboardShortcutsEnabled && (
        <KeyboardShortcut
          keys="alt"
          onKeyDown={() => onToolChange(WorkspaceTool.LINK)}
          onKeyRelease={() => onToolChange(WorkspaceTool.MOVE)}
        />
      )}
      {areKeyboardShortcutsEnabled && (
        <KeyboardShortcut
          keys="m"
          onKeyDown={() => onToolChange(WorkspaceTool.MOVE)}
        />
      )}
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
