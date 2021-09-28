import React from 'react';
import { Space, Divider } from 'antd';
import { ResourceType } from '@cognite/data-exploration';
import { InternalId } from '@cognite/sdk';
import DownloadButton from './DownloadButton';
import { PowerBIButton, GrafanaButton } from './CopyIdsButton';
import DeselectButton from './DeselectButton';

export type ActionsProps = {
  ids: InternalId[];
  resourceType: ResourceType;
};

export const Actions = ({ resourceType, ids }: ActionsProps) => {
  return (
    <Space>
      <Divider type="vertical" style={{ height: '36px' }} />
      <DownloadButton ids={ids} resourceType={resourceType} />
      <PowerBIButton ids={ids} resourceType={resourceType} />
      <GrafanaButton ids={ids} resourceType={resourceType} />
      <DeselectButton />
    </Space>
  );
};
