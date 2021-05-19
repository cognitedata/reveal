import { FileInfo } from 'cognite-sdk-v3/dist/src';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { ResourceType } from 'modules/types';
import DetectedTags from 'components/DetectedTags';
import React from 'react';

export const getColumns = (resourceType: ResourceType) => {
  const isAsset = resourceType === 'assets';

  const descriptionColumn = {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    sorter: (a: any, b: any) => stringCompare(a?.description, b?.description),
    render: (description: string) => description ?? '-',
  };

  const detectedTagsColumn = {
    title: 'Detected tags',
    key: 'tags',
    render: (row: FileInfo) => <DetectedTags fileId={row.id} />,
  };

  return [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
      render: (name: string) => name ?? '-',
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
