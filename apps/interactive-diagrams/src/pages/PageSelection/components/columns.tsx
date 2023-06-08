import React from 'react';

import { Flex, Popover } from '@interactive-diagrams-app/components/Common';
import DetectedTags from '@interactive-diagrams-app/components/DetectedTags';
import InteractiveIcon from '@interactive-diagrams-app/components/InteractiveIcon';
import { ResourceType } from '@interactive-diagrams-app/modules/types';
import {
  dateSorter,
  stringCompare,
} from '@interactive-diagrams-app/utils/utils';

import { Icon } from '@cognite/cogs.js';
import {
  FileSmallPreviewUFV,
  AssetSmallPreviewUFV,
} from '@cognite/data-exploration';
import { FileInfo, Asset } from '@cognite/sdk';

export const getColumns: any = (resourceType: ResourceType) => {
  const isAsset = resourceType === 'assets';

  const descriptionColumn = {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    sorter: (a: any, b: any) => stringCompare(a?.description, b?.description),
    render: (description: string) => description ?? '—',
  };

  const detectedTagsColumn = {
    title: 'Linked to',
    key: 'tags',
    render: (file: FileInfo) => <DetectedTags fileId={file?.id} />,
  };

  const nameColumn = (resource: any) => (
    <Flex row align style={{ justifyContent: 'flex-start' }}>
      <Popover
        content={
          isAsset ? (
            <AssetSmallPreviewUFV assetId={(resource as Asset)?.id} />
          ) : (
            <FileSmallPreviewUFV fileId={(resource as FileInfo)?.id} />
          )
        }
      >
        <Flex align justify>
          {isAsset ? <Icon type="Assets" /> : <InteractiveIcon />}
        </Flex>
      </Popover>
      <span style={{ marginLeft: '12px', fontWeight: 500 }}>
        {resource?.name ?? '—'}
      </span>
    </Flex>
  );

  return [
    {
      title: 'Name',
      key: 'name',
      sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
      render: nameColumn,
    },
    isAsset ? descriptionColumn : detectedTagsColumn,
    {
      title: 'Last modified',
      key: 'lastUpdatedTime',
      dataIndex: 'lastUpdatedTime',
      sorter: (item: any) => dateSorter(item?.lastUpdatedTime),
      render: (lastUpdatedTime: Date) =>
        lastUpdatedTime ? new Date(lastUpdatedTime).toLocaleDateString() : '—',
    },
  ];
};
