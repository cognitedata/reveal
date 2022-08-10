import React from 'react';
import { Space, Divider } from 'antd';
import { ResourceItem } from '@cognite/data-exploration';
import DownloadButton from './DownloadButton';
import { PowerBIButton, GrafanaButton } from './CopyIdsButton';
import { DateFilter } from 'app/components/ResourceTitleRow';

type TitleRowActionsProps = {
  item: ResourceItem;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  dateFilter?: DateFilter;
};

export const TitleRowActions = ({
  item,
  dateFilter,
  afterDefaultActions,
  beforeDefaultActions,
}: TitleRowActionsProps) => {
  return (
    <Space style={{ float: 'right' }}>
      <Divider type="vertical" style={{ height: '36px' }} />
      {beforeDefaultActions}
      <DownloadButton item={item} dateFilter={dateFilter} />
      <PowerBIButton item={item} />
      <GrafanaButton item={item} />
      {afterDefaultActions}
    </Space>
  );
};
