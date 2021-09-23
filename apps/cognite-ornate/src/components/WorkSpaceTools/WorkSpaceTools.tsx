import { useEffect } from 'react';
import { ToolType } from 'library/types';

import { WorkSpaceToolsWrapper } from './elements';

type WorkSpaceToolsProps = {
  activeTool: ToolType;
  onToolChange: (nextTool: ToolType) => void;
};

const WorkSpaceTools = ({ activeTool, onToolChange }: WorkSpaceToolsProps) => {
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

  return (
    <WorkSpaceToolsWrapper>
      <button
        type="button"
        onClick={() => {
          onToolChange('move');
        }}
        disabled={activeTool === 'move'}
      >
        [M]ove
      </button>
      <button
        type="button"
        onClick={() => {
          onToolChange('line');
        }}
        disabled={activeTool === 'line'}
      >
        [L]ine
      </button>
      <button
        type="button"
        onClick={() => {
          onToolChange('rect');
        }}
        disabled={activeTool === 'rect'}
      >
        [R]ect
      </button>
      <button
        type="button"
        onClick={() => {
          onToolChange('text');
        }}
        disabled={activeTool === 'text'}
      >
        [T]ext
      </button>
      <button
        type="button"
        onClick={() => {
          onToolChange('circle');
        }}
        disabled={activeTool === 'circle'}
      >
        [C]ircle
      </button>

      <button
        type="button"
        onClick={() => {
          onToolChange('default');
        }}
        disabled={activeTool === 'default'}
      >
        [S]elect
      </button>
    </WorkSpaceToolsWrapper>
  );
};

export default WorkSpaceTools;
