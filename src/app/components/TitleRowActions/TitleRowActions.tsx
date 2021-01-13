import React from 'react';
import { Space, Divider, Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceItem } from 'lib/types';
import DownloadButton from './DownloadButton';
import { PowerBIButton, GrafanaButton } from './CopyIdsButton';

type TitleRowActionsProps = {
  item: ResourceItem;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
};

export const TitleRowActions = ({
  item,
  afterDefaultActions,
  beforeDefaultActions,
}: TitleRowActionsProps) => {
  return (
    <Space style={{ float: 'right' }}>
      <Divider type="vertical" style={{ height: '36px' }} />
      {beforeDefaultActions}
      <DownloadButton item={item} />
      <CollectionsDropdown
        items={[{ id: item.id }]}
        type={item.type}
        button={
          <Tooltip title="Collection">
            <Button icon="Folder" />
          </Tooltip>
        }
      />
      <PowerBIButton item={item} />
      <GrafanaButton item={item} />
      {afterDefaultActions}
    </Space>
  );
};
