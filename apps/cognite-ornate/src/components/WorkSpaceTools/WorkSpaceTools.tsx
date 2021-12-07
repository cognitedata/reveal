import { useState } from 'react';
import { ToolType } from '@cognite/ornate';
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import {
  AnnotationIcon,
  DrawingIcon,
  MarkerIcon,
} from 'components/CustomIcons';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

type Layer = 'ANNOTATIONS' | 'DRAWINGS' | 'MARKERS';

type WorkSpaceToolsProps = {
  activeTool: ToolType;
  isSidebarExpanded: boolean;
  isDisabled: boolean;
  onToolChange: (nextTool: ToolType) => void;
  onSetLayerVisibility: (layer: Layer, visible: boolean) => void;
};

const WorkSpaceTools = ({
  activeTool,
  isDisabled,
  isSidebarExpanded,
  onToolChange,
  onSetLayerVisibility,
}: WorkSpaceToolsProps) => {
  const metrics = useMetrics('WorkSpaceTools');
  const [layerStatus, setLayerStatus] = useState<Record<Layer, boolean>>({
    ANNOTATIONS: true,
    DRAWINGS: true,
    MARKERS: true,
  });

  const onToolClick = (type: ToolType) => {
    metrics.track('onToolClick', { type });
    onToolChange(type);
  };

  const onToggleLayer = (layer: Layer) => {
    onSetLayerVisibility(layer, !layerStatus[layer]);
    setLayerStatus((prev) => ({
      ...prev,
      [layer]: !layerStatus[layer],
    }));
  };

  const toolbarWrapperClasses = isDisabled ? 'disabled' : '';

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
    <WorkSpaceToolsWrapper
      className={
        isSidebarExpanded
          ? `expanded ${toolbarWrapperClasses}`
          : toolbarWrapperClasses
      }
    >
      <Dropdown
        content={
          <Menu>
            <Menu.Header>Click to turn on / off</Menu.Header>
            <Menu.Item
              onClick={() => {
                onToggleLayer('ANNOTATIONS');
              }}
              style={styleItem(layerStatus.ANNOTATIONS)}
            >
              <AnnotationIcon style={{ marginRight: 8 }} />
              Annotations
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onToggleLayer('DRAWINGS');
              }}
              style={styleItem(layerStatus.DRAWINGS)}
            >
              <DrawingIcon style={{ marginRight: 8 }} />
              Drawings
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                onToggleLayer('MARKERS');
              }}
              style={styleItem(layerStatus.MARKERS)}
            >
              <MarkerIcon style={{ marginRight: 8 }} />
              Markers
            </Menu.Item>
          </Menu>
        }
        placement="auto-end"
      >
        <Button
          type="ghost"
          size="small"
          onClick={() => {
            onToolClick('default');
          }}
          title="Layers"
        >
          <Icon type="Layers" />
        </Button>
      </Dropdown>
      <ToolboxSeparator />
      <Button
        type="ghost"
        size="small"
        onClick={() => {
          onToolClick('default');
        }}
        title="Select S"
        disabled={activeTool === 'default'}
      >
        <Icon type="Cursor" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Move M"
        onClick={() => {
          onToolClick('move');
        }}
        disabled={activeTool === 'move'}
      >
        <Icon type="Grab" />
      </Button>
      <ToolboxSeparator />
      <Button
        type="ghost"
        size="small"
        title="Line L"
        onClick={() => {
          onToolClick('line');
        }}
        disabled={activeTool === 'line'}
      >
        <Icon type="Highlighter" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Rectangle R"
        onClick={() => {
          onToolClick('rect');
        }}
        disabled={activeTool === 'rect'}
      >
        <Icon type="FrameTool" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Circle C"
        onClick={() => {
          onToolClick('circle');
        }}
        disabled={activeTool === 'circle'}
      >
        <Icon type="ColorPalette" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Text T"
        onClick={() => {
          onToolClick('text');
        }}
        disabled={activeTool === 'text'}
      >
        <Icon type="Text" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Comment"
        onClick={() => {
          onToolChange('comment');
        }}
        disabled={activeTool === 'comment'}
      >
        <Icon type="Comment" />
      </Button>
      <ToolboxSeparator />
      <Button
        type="ghost"
        size="small"
        title="List I"
        onClick={() => {
          onToolClick('list');
        }}
        disabled={activeTool === 'list'}
      >
        <Icon type="Checklist" />
      </Button>
      <Button
        type="ghost"
        size="small"
        title="Stamp k"
        onClick={() => {
          onToolClick('stamp');
        }}
        disabled={activeTool === 'stamp'}
      >
        <Icon type="Checkmark" />
      </Button>
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
