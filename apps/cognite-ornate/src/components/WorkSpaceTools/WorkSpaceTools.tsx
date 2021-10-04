import { useEffect } from 'react';
import { ToolType } from 'library/types';
import { Button, Icon } from '@cognite/cogs.js';

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
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
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
      if (e.key === 's') {
        onToolChange('default');
      }
    });
  }, []);

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
          onToolChange('default');
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
          onToolChange('move');
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
          onToolChange('line');
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
          onToolChange('rect');
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
          onToolChange('circle');
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
          onToolChange('text');
        }}
        disabled={activeTool === 'text'}
      >
        <Icon type="TextTool" />
      </Button>
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
