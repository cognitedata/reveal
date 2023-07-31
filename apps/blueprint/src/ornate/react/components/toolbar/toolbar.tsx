import { Button, Icon, IconType } from '@cognite/cogs.js';
import { useEffect } from 'react';

import { ToolType } from '../../../tools';

import {
  ToolboxSeparator,
  WorkSpaceToolsWrapper,
  SecondaryToolbar,
} from './elements';

export type OrnateToolbarProps = {
  activeTool: ToolType;
  setActiveTool: (next: ToolType) => void;
  tools?: ToolReference[];
  secondaryToolbar?: React.ReactElement | null;
};

export type ToolReference = ToolType | 'DIVIDER';

export const toolDisplay: Record<
  ToolReference,
  { icon: IconType; name: string; shortcut?: string } | undefined
> = {
  DIVIDER: undefined,
  HAND: {
    icon: 'Grab',
    name: 'Hand',
  },
  SELECT: {
    icon: 'Cursor',
    name: 'Select',
    shortcut: 'v',
  },
  RECT: {
    icon: 'FrameTool',
    name: 'Rectangle',
    shortcut: 'r',
  },
  LINE: {
    icon: 'Highlighter',
    name: 'Line',
    shortcut: 'l',
  },
  PATH: {
    icon: 'Polygon',
    name: 'Path',
    shortcut: 'p',
  },
  CIRCLE: {
    icon: 'Dot',
    name: 'Circle',
    shortcut: 'c',
  },
  TEXT: {
    icon: 'Text',
    name: 'Text',
    shortcut: 't',
  },
  STAMP: {
    icon: 'Certificate',
    name: 'Stamp',
    shortcut: 's',
  },
  LIST: {
    icon: 'List',
    name: 'List',
    shortcut: 'l',
  },
};

export const Toolbar = ({
  activeTool,
  setActiveTool,
  tools,
  secondaryToolbar,
}: OrnateToolbarProps) => {
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      Object.keys(toolDisplay || {}).forEach((tool) => {
        const ref = tool as ToolReference;
        if (toolDisplay[ref]?.shortcut === e.key && ref !== 'DIVIDER') {
          setActiveTool(ref);
        }
      });
    });
  });

  const renderTools = () => {
    return (tools || []).map((tool, i) => {
      const display = toolDisplay[tool];
      if (!display || tool === 'DIVIDER') {
        // eslint-disable-next-line react/no-array-index-key
        return <ToolboxSeparator key={`DIVIDER-${i}`} />;
      }
      return (
        <Button
          key={display.name}
          type={activeTool === tool ? 'primary' : 'ghost'}
          size="small"
          onClick={() => {
            setActiveTool(tool);
          }}
          title={display.name}
        >
          <Icon type={display.icon} />
        </Button>
      );
    });
  };

  return (
    <WorkSpaceToolsWrapper className="ornate-toolbar">
      {renderTools()}
      {secondaryToolbar && (
        <SecondaryToolbar>{secondaryToolbar}</SecondaryToolbar>
      )}
    </WorkSpaceToolsWrapper>
  );
};
