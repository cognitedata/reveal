import React from 'react';

import { useTranslation } from '@access-management/common/i18n';
import { Tag, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';

import { ApiKeyObject } from '@cognite/sdk';

import Actions from './Actions';

const { Text } = Typography;

interface ApiKey extends ApiKeyObject {
  serviceAccountName?: string;
}

export const useAPIKeyTableColumns = () => {
  const { t } = useTranslation();
  const columns: ColumnType<ApiKey>[] = [
    {
      title: t('id'),
      dataIndex: 'id',
      width: 220,
      sorter: (a, b) => {
        return a.id - b.id;
      },
      render(id: number) {
        return (
          <Text data-testid="group-cat-id" copyable={{ text: `${id}` }}>
            {id}
          </Text>
        );
      },
    },
    {
      title: t('service-account'),
      dataIndex: 'serviceAccountName',
      sorter: (a, b) => {
        return a.serviceAccountName && b.serviceAccountName
          ? a.serviceAccountName.localeCompare(b.serviceAccountName)
          : -1;
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
      render(status) {
        return (
          <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
        );
      },
    },
    {
      title: t('created-at'),
      dataIndex: 'createdTime',
      sorter: (a, b) => {
        return a?.serviceAccountName && b?.serviceAccountName
          ? a.serviceAccountName.localeCompare(b.serviceAccountName)
          : -1;
      },
      render(createdTime: Date) {
        return createdTime.toJSON();
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (item: ApiKey) => <Actions id={item.id} />,
    },
  ];

  return { columns };
};
