import React from 'react';
import { Space, Button } from 'antd';
import { Icon } from '@cognite/cogs.js';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceItem } from 'lib/types';
import DownloadButton from './DownloadButton';
import CopyIdsButton from './CopyIdsButton';
import { EditFileButton } from './EditFileButton';
import { MaximizeButton } from './MaximizeButton';

export type TitleRowActions =
  | 'FileEdit'
  | 'Download'
  | 'Collections'
  | 'Copy'
  | 'Open';

const TitleRowItem: {
  [key in TitleRowActions]: (props: { item: ResourceItem }) => React.ReactNode;
} = {
  FileEdit: EditFileButton,
  Download: DownloadButton,
  Collections: ({ item }) =>
    CollectionsDropdown({
      items: [{ id: item.id }],
      type: item.type,
      button: <Button type="ghost" icon={<Icon type="Folder" />} />,
    }),
  Copy: CopyIdsButton,
  Open: MaximizeButton,
};

export type TitleRowActionsProps = {
  item: ResourceItem;
  actions?: (
    | TitleRowActions
    | ((props: { item: ResourceItem }) => React.ReactNode)
  )[];
};

export const TitleRowActions = ({
  actions = ['FileEdit', 'Download', 'Collections', 'Copy', 'Open'],
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
