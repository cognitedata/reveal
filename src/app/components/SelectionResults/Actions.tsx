import React from 'react';
import { Space } from 'antd';
import { Button } from '@cognite/cogs.js';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceType } from 'lib/types';
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
      <DownloadButton ids={ids} resourceType={resourceType} />
      <CollectionsDropdown
        items={ids}
        type={resourceType}
        button={
          <Button variant="outline" icon="Folder">
            Collections
          </Button>
        }
      />
      <PowerBIButton ids={ids} resourceType={resourceType} />
      <GrafanaButton ids={ids} resourceType={resourceType} />
      <DeselectButton />
    </Space>
  );
};
