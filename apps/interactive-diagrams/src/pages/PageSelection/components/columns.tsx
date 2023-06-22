import React from 'react';

import { Icon } from '@cognite/cogs.js';
import { AssetSmallPreview, FileSmallPreview } from '@cognite/data-exploration';
import { FileInfo, Asset } from '@cognite/sdk';

import { Flex, Popover } from '../../../components/Common';
import DetectedTags from '../../../components/DetectedTags';
import InteractiveIcon from '../../../components/InteractiveIcon';
import { ResourceType } from '../../../modules/types';
import { dateSorter, stringCompare } from '../../../utils/utils';

export const getColumns: any = (resourceType: ResourceType) => {
  const isAsset = resourceType === 'assets';

  const descriptionColumn = {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    sorter: (a: any, b: any) => stringCompare(a?.description, b?.description),
    render: (description: string) => description ?? '-',
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
            <AssetSmallPreview assetId={(resource as Asset)?.id} />
          ) : (
            <FileSmallPreview fileId={(resource as FileInfo)?.id} />
          )
        }
      >
        <Flex align justify>
          {isAsset ? <Icon type="Assets" /> : <InteractiveIcon />}
        </Flex>
      </Popover>
      <span style={{ marginLeft: '12px', fontWeight: 500 }}>
        {resource?.name ?? '-'}
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
        lastUpdatedTime ? new Date(lastUpdatedTime).toLocaleDateString() : '-',
    },
  ];
};
