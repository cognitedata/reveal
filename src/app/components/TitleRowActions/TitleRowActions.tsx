import React from 'react';
import { Space } from 'antd';
import { Button } from '@cognite/cogs.js';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceItem } from 'lib/types';
import DownloadButton from './DownloadButton';
import CopyIdsButton from './CopyIdsButton';

export type TitleRowActions = 'Download' | 'Collections' | 'Copy';

const TitleRowItem: {
  [key in TitleRowActions]: (props: { item: ResourceItem }) => React.ReactNode;
} = {
  Download: DownloadButton,
  Collections: ({ item }) =>
    CollectionsDropdown({
      items: [{ id: item.id }],
      type: item.type,
      button: <Button variant="outline" icon="Folder" />,
    }),
  Copy: CopyIdsButton,
};

export type TitleRowActionsProps = {
  item: ResourceItem;
  actions?: (
    | TitleRowActions
    | ((props: { item: ResourceItem }) => React.ReactNode)
  )[];
};

export const TitleRowActions = ({
  actions = ['Download', 'Collections', 'Copy'],
  item,
}: TitleRowActionsProps) => {
  return (
    <Space>
      {actions.map((key, i) => (
        <div key={typeof key === 'string' ? key : `custom-${i}`}>
          {(typeof key === 'string' ? TitleRowItem[key] : key)({ item })}
        </div>
      ))}
    </Space>
  );
};
