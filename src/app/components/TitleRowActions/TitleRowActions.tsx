import React from 'react';
import { Space } from 'antd';
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
      {beforeDefaultActions}
      <DownloadButton item={item} />
      <CollectionsDropdown
        items={[{ id: item.id }]}
        type={item.type}
        button={
          <Button variant="outline" icon="Folder">
            Collection
          </Button>
        }
      />
      <PowerBIButton item={item} />
      <GrafanaButton item={item} />
      {afterDefaultActions}
    </Space>
  );
};
