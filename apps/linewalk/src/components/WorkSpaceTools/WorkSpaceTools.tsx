import Konva from 'konva';
import { useEffect, useState } from 'react';
import {
  CircleTool,
  CogniteOrnate,
  CommentTool,
  DefaultTool,
  LineTool,
  MoveTool,
  RectTool,
  TextTool,
  ToolType,
  SquiggleTool,
} from '@cognite/ornate';
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { AnnotationIcon, DrawingIcon } from 'components/CustomIcons';

import usePrevious from '../../hooks/usePrevious';
import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

type Layer = 'ANNOTATIONS' | 'DRAWINGS' | 'MARKERS';

export enum WorkspaceTool {
  LAYERS = 'layers',
  SELECT = 'select',
  MOVE = 'move',
  LINE = 'line',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  COMMENT = 'comment',
  SQUIGGLE = 'squiggle',
}

type WorkSpaceToolsProps = {
  enabledTools?: WorkspaceTool[];
  ornateRef?: CogniteOrnate;
  areKeyboardShortcutsEnabled: boolean;
};

const WorkSpaceTools = ({
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
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const previousTool = usePrevious(activeTool);
  const [layerStatus, setLayerStatus] = useState<Record<Layer, boolean>>({
    ANNOTATIONS: true,
    DRAWINGS: true,
    MARKERS: true,
  });

  useEffect(() => {
    if (ornateRef) {
      // eslint-disable-next-line no-param-reassign
      ornateRef.tools = {
        move: new MoveTool(ornateRef),
        line: new LineTool(ornateRef),
        rect: new RectTool(ornateRef),
        circle: new CircleTool(ornateRef),
        text: new TextTool(ornateRef),
        comment: new CommentTool(ornateRef),
        squiggle: new SquiggleTool(ornateRef),
        default: new DefaultTool(ornateRef),
      };
      onToolChange('default');
    }
  }, [ornateRef]);

  useEffect(() => {
    ornateRef?.handleToolChange(activeTool);
  }, [ornateRef, activeTool]);

  const onToolChange = (tool: ToolType) => {
    if (tool !== activeTool) {
      setActiveTool(tool);
    }
  };

  const onSetLayerVisibility = (layer: Layer, visible: boolean) => {
    const shapes: Konva.Node[] = [];
    if (layer === 'ANNOTATIONS') {
      // Get annotations. Then filter out the ones affected by the list tool
      shapes.push(
        ...(ornateRef?.stage.find('.annotation') || []).filter(
          (shape) => !shape.attrs.inList
        )
      );
    }
    if (layer === 'DRAWINGS') {
      shapes.push(
        ...(ornateRef?.stage.find('.drawing') || []).filter(
          (shape) => !shape.attrs.inList
        )
      );
    }
    if (layer === 'MARKERS') {
      shapes.push(...(ornateRef?.stage.find('.marker') || []));
    }
    shapes.forEach((shape) => {
      if (visible) {
        shape.show();
      } else {
        shape.hide();
      }
    });
  };

  const onToggleLayer = (layer: Layer) => {
    onSetLayerVisibility(layer, !layerStatus[layer]);
    setLayerStatus((prev) => ({
      ...prev,
      [layer]: !layerStatus[layer],
    }));
  };

  const styleItem = (visible: boolean) => {
    const style = {
      marginRight: 16,
      filter: '',
      opacity: 1,
    };
    if (!visible) {
      style.filter = 'grayscale(1)';
      style.opacity = 0.66;
    }
    return style;
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
                  onClick={() => onToggleLayer('ANNOTATIONS')}
                  style={styleItem(layerStatus.ANNOTATIONS)}
                >
                  <AnnotationIcon style={{ marginRight: 8 }} />
                  lineReviews
                </Menu.Item>
                <Menu.Item
                  onClick={() => onToggleLayer('DRAWINGS')}
                  style={styleItem(layerStatus.DRAWINGS)}
                >
                  <DrawingIcon style={{ marginRight: 8 }} />
                  Drawings
                </Menu.Item>
              </Menu>
            }
            placement="auto-end"
          >
            <Button
              type="ghost"
              size="small"
              onClick={() => onToolChange('default')}
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
          onClick={() => onToolChange('default')}
          title="Select S"
          disabled={activeTool === 'default'}
        >
          <Icon type="Cursor" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.MOVE) && (
        <Button
          type="ghost"
          size="small"
          title="Move M"
          onClick={() => onToolChange('move')}
          disabled={activeTool === 'move'}
        >
          <Icon type="Grab" />
        </Button>
      )}
      <ToolboxSeparator />
      {enabledTools.includes(WorkspaceTool.LINE) && (
        <Button
          type="ghost"
          size="small"
          title="Line L"
          onClick={() => onToolChange('line')}
          disabled={activeTool === 'line'}
        >
          <Icon type="Highlighter" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.RECTANGLE) && (
        <Button
          type="ghost"
          size="small"
          title="Rectangle R"
          onClick={() => onToolChange('rect')}
          disabled={activeTool === 'rect'}
        >
          <Icon type="FrameTool" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.CIRCLE) && (
        <Button
          type="ghost"
          size="small"
          title="Circle C"
          onClick={() => onToolChange('circle')}
          disabled={activeTool === 'circle'}
        >
          <Icon type="ColorPalette" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.TEXT) && (
        <Button
          type="ghost"
          size="small"
          title="Text T"
          onClick={() => onToolChange('text')}
          disabled={activeTool === 'text'}
        >
          <Icon type="Text" />
        </Button>
      )}
      {enabledTools.includes(WorkspaceTool.COMMENT) && (
        <Button
          type="ghost"
          size="small"
          title="Comment"
          onClick={() => onToolChange('comment')}
          disabled={activeTool === 'comment'}
        >
          <Icon type="Comment" />
        </Button>
      )}
      <Button
        type="ghost"
        size="small"
        title="Squiggle"
        onClick={() => onToolChange('squiggle')}
        disabled={activeTool === 'squiggle'}
      >
        <Icon type="Lineage" />
      </Button>
      {areKeyboardShortcutsEnabled && (
        <>
          <KeyboardShortcut
            keys="s"
            onKeyDown={() => onToolChange('default')}
          />
          <KeyboardShortcut keys="m" onKeyDown={() => onToolChange('move')} />
          <KeyboardShortcut keys="r" onKeyDown={() => onToolChange('rect')} />
          <KeyboardShortcut keys="c" onKeyDown={() => onToolChange('circle')} />
          <KeyboardShortcut keys="l" onKeyDown={() => onToolChange('line')} />
          <KeyboardShortcut keys="t" onKeyDown={() => onToolChange('text')} />
          <KeyboardShortcut
            keys="space"
            onKeyDown={() => onToolChange('move')}
            onKeyRelease={() => {
              if (previousTool) {
                onToolChange(previousTool);
              }
            }}
          />
        </>
      )}
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
