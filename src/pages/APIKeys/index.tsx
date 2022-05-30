import React, { useState } from 'react';

import { Col, Input, Checkbox, Row, Table } from 'antd';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import LegacyLoginFlowWarning from 'pages/IDP/LegacyLoginFlowWarning';
import columns from './columns';
import { stringContains } from '../Groups/utils';
import { useTranslation } from 'common/i18n';

export default function APIKeys() {
  const { t } = useTranslation();
  const sdk = useSDK();

  const [searchValue, setSearchValue] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const { data: apiKeys = [], isFetched } = useQuery(['api-keys'], async () => {
    const serviceAccounts = await sdk.serviceAccounts.list();
    const list = await sdk.apiKeys.list({ all: true, includeDeleted: true });
    return list.map((k) => ({
      ...k,
      serviceAccountName: serviceAccounts.find(
        (s) => s.id === k.serviceAccountId
      )?.name,
    }));
  });

  return (
    <>
      <LegacyLoginFlowWarning />
      <Row justify="space-between">
        <Col>
          <Input.Search
            placeholder={t('filter-by-service-account-or-id')}
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            allowClear
            style={{
              width: '326px',
              height: '40px',
            }}
          />
        </Col>
        <Col>
          <Checkbox
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          >
            {t('display-deleted-key')}
          </Checkbox>
        </Col>
      </Row>
      <Table
        loading={!isFetched}
        columns={columns}
        rowKey="id"
        dataSource={apiKeys
          .filter((a) => (showDeleted ? true : a.status === 'ACTIVE'))
          .filter(
            (a) =>
              stringContains(String(a.serviceAccountId) ?? a.id, searchValue) ||
              stringContains(String(a.serviceAccountName) ?? a.id, searchValue)
          )}
        pagination={{ pageSize: 25, hideOnSinglePage: true }}
      />
    </>
  );
}
