import React from 'react';

import { Tag, Typography } from 'antd';

import { ColumnType } from 'antd/lib/table';
import { ApiKeyObject } from '@cognite/sdk';

import Actions from './Actions';
import { useTranslation } from 'common/i18n';

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
      title: t('service-account_one'),
      dataIndex: 'serviceAccountName',
      sorter: (a, b) => {
        return a.serviceAccountName && b.serviceAccountName
          ? a.serviceAccountName.localeCompare(b.serviceAccountName)
          : -1;
      },
    },
    {
      title: t('text-status'),
      dataIndex: 'status',
      render(status) {
        return (
          <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
        );
      },
    },
    {
      title: t('text-created-at'),
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
      title: t('text-actions'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (item: ApiKey) => <Actions id={item.id} />,
    },
  ];

  return { columns };
};
