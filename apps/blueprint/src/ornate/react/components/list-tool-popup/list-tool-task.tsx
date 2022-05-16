import { useState } from 'react';
import { Dropdown, Menu } from '@cognite/cogs.js';

import { OrnateListToolItem } from '../../../tools';

import { ListStatus } from './types';
import { ListItemStatusButton } from './elements';

type Props = {
  listItem: OrnateListToolItem;
  listStatuses: ListStatus[];
  onChange: (
    listItem: Partial<OrnateListToolItem>,
    nextStatus?: ListStatus
  ) => void;
};

export const Task = ({ listItem, onChange, listStatuses }: Props) => {
  const [showContent, setShowContent] = useState(false);
  return (
    <Dropdown
      visible={showContent}
      onClickOutside={() => setShowContent(false)}
      content={
        <Menu>
          {listStatuses.map((status) => (
            <Menu.Item
              key={status.status}
              onClick={() => {
                setShowContent(false);
                onChange(
                  {
                    ...listItem,
                    status: status.status,
                  },
                  status
                );
              }}
            >
              {status.status}
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
      <ListItemStatusButton
        style={{
          color: listItem.status
            ? listStatuses.find(
                (listStatus) =>
                  // Using toLowerCase for backwards compatibility.
                  listStatus.status.toLowerCase() ===
                  listItem.status?.toLowerCase()
              )?.styleOverrides.stroke
            : 'var(--cogs-greyscale-grey6)',
        }}
        onClick={() => setShowContent(true)}
      >
        {listItem.status || 'EXAMINE'}
      </ListItemStatusButton>
    </Dropdown>
  );
};
