import { useEffect } from 'react';
import { ToolType } from 'library/types';
import { Button, Icon } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

type WorkSpaceToolsProps = {
  activeTool: ToolType;
  isSidebarExpanded: boolean;
  isDisabled: boolean;
  onToolChange: (nextTool: ToolType) => void;
};

const WorkSpaceTools = ({
  activeTool,
  isDisabled,
  isSidebarExpanded,
  onToolChange,
}: WorkSpaceToolsProps) => {
  const metrics = useMetrics('WorkSpaceTools');
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (!isDisabled) {
        metrics.track('onHotkey', { key: e.key });
        if (e.key === 'm') {
          onToolChange('move');
        }
        if (e.key === 'r') {
          onToolChange('rect');
        }
        if (e.key === 'l') {
          onToolChange('line');
        }
        if (e.key === 't') {
          onToolChange('text');
        }
        if (e.key === 'c') {
          onToolChange('circle');
        }
        if (e.key === 'i') {
          onToolChange('list');
        }
        if (e.key === 's') {
          onToolChange('default');
        }
      }
    });
  }, []);

  const onToolClick = (type: ToolType) => {
    metrics.track('onToolClick', { type });
    onToolChange(type);
  };

  const toolbarWrapperClasses = isDisabled ? 'disabled' : '';

  return (
    <WorkSpaceToolsWrapper
      className={
        isSidebarExpanded
          ? `expanded ${toolbarWrapperClasses}`
          : toolbarWrapperClasses
      }
    >
      <Button
        type="ghost"
        size="small"
        onClick={() => {
          onToolClick('default');
        }}
        title="Select S"
        disabled={activeTool === 'default'}
      >
        <Icon type="SelectCursor" />
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
        <Icon type="GrabAndMove" />
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
        <Icon type="LineTool" />
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
        <Icon type="BoxTool" />
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
        <Icon type="TextTool" />
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
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
