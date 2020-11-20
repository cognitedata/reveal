import React from 'react';
import { Button, Space } from 'antd';
import { Icon } from '@cognite/cogs.js';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceType } from 'lib/types';
import { InternalId } from '@cognite/sdk';
import DownloadButton from './DownloadButton';
import CopyIdsButton from './CopyIdsButton';
import DeselectButton from './DeselectButton';

export type TitleRowActions = 'Download' | 'Collections' | 'Copy' | 'Close';

const TitleRowItem: {
  [key in TitleRowActions]: (props: {
    ids: InternalId[];
    resourceType: ResourceType;
  }) => React.ReactNode;
} = {
  Download: DownloadButton,
  Collections: ({ ids, resourceType }) =>
    ids.length > 0 &&
    CollectionsDropdown({
      items: ids,
      type: resourceType,
      button: <Button type="ghost" icon={<Icon type="Folder" />} />,
    }),
  Copy: CopyIdsButton,
  Close: DeselectButton,
};

export type ActionsProps = {
  ids: InternalId[];
  resourceType: ResourceType;
  actions?: (
    | TitleRowActions
    | ((props: {
        ids: InternalId[];
        resourceType: ResourceType;
      }) => React.ReactNode)
  )[];
};

export const Actions = ({
  actions = ['Download', 'Collections', 'Copy', 'Close'],
  resourceType,
  ids,
}: ActionsProps) => {
  return (
    <Space>
      {actions.map((key, i) => (
        <div key={typeof key === 'string' ? key : `custom-${i}`}>
          {(typeof key === 'string' ? TitleRowItem[key] : key)({
            ids,
            resourceType,
          })}
        </div>
      ))}
    </Space>
  );
};
