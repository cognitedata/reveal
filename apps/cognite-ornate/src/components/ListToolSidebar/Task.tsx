import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useState } from 'react';
import { ShapeConfig } from 'konva/lib/Shape';

import { ListItem, ListToolStatus } from './ListToolSidebar';

type Props = {
  listItem: ListItem;
  onChange: (listItem: Partial<ListItem>) => void;
};

export const LIST_TOOL_STATUSES: Record<
  ListToolStatus,
  { display: string; styleOverrides: ShapeConfig }
> = {
  CLOSE: {
    display: 'CLOSE',
    styleOverrides: {
      fill: 'rgba(255, 0, 0, 0.2)',
      stroke: 'rgba(255, 0, 0, 0.4)',
      cornerRadius: 5,
    },
  },
  OPEN: {
    display: 'OPEN',
    styleOverrides: {
      fill: 'rgba(0, 255, 0, 0.2)',
      stroke: 'rgba(0, 255, 0, 0.4)',
      cornerRadius: 50,
    },
  },
};

const Task = ({ listItem, onChange }: Props) => {
  const [showContent, setShowContent] = useState(false);
  return (
    <Dropdown
      visible={showContent}
      onClickOutside={() => setShowContent(false)}
      content={
        <Menu>
          {Object.keys(LIST_TOOL_STATUSES).map((statusKey) => (
            <Menu.Item
              key={statusKey}
              onClick={() => {
                setShowContent(false);
                onChange({
                  ...listItem,
                  status: statusKey as ListToolStatus,
                });
              }}
            >
              {LIST_TOOL_STATUSES[statusKey as ListToolStatus].display}
            </Menu.Item>
          ))}

          <Menu.Item
            onClick={() => {
              setShowContent(false);
              onChange({
                ...listItem,
                status: undefined,
              });
            }}
          >
            EXAMINE
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        unstyled
        className="list-item__status"
        style={{
          color: listItem.status
            ? String(LIST_TOOL_STATUSES[listItem.status].styleOverrides.stroke)
            : 'var(--cogsr-greyscale-grey6',
        }}
        onClick={() => setShowContent(true)}
      >
        {listItem.status || 'EXAMINE'}
      </Button>
    </Dropdown>
  );
};

export default Task;
