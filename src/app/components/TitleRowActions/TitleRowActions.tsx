import React from 'react';
import { Space, Divider } from 'antd';
import { ResourceItem } from '@cognite/data-exploration';
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
      <PowerBIButton item={item} />
      <GrafanaButton item={item} />
      {afterDefaultActions}
    </Space>
  );
};
