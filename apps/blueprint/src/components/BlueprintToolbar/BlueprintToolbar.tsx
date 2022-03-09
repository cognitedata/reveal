import { Button, Icon } from '@cognite/cogs.js';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

export type BlueprintToolbarProps = {
  activeTool: string;
  setActiveTool: (next: string) => void;
};

export const BlueprintToolbar = ({
  activeTool,
  setActiveTool,
}: BlueprintToolbarProps) => {
  return (
    <WorkSpaceToolsWrapper>
      <Button
        type={activeTool === 'default' ? 'primary' : 'ghost'}
        size="small"
        onClick={() => {
          setActiveTool('default');
        }}
        title="Layers"
      >
        <Icon type="Cursor" />
      </Button>

      <ToolboxSeparator />
      <Button
        type={activeTool === 'rect' ? 'primary' : 'ghost'}
        size="small"
        onClick={() => {
          setActiveTool('rect');
        }}
        title="Rectangle"
      >
        <Icon type="FrameTool" />
      </Button>

      <Button
        type={activeTool === 'line' ? 'primary' : 'ghost'}
        size="small"
        onClick={() => {
          setActiveTool('line');
        }}
        title="Line"
      >
        <Icon type="VectorLine" />
      </Button>
    </WorkSpaceToolsWrapper>
  );
};
