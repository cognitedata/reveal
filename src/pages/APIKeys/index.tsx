import React, { useState } from 'react';

import { Col, Input, Checkbox, Row, Table } from 'antd';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import columns from './columns';

export default function APIKeys() {
  const sdk = useSDK();

  const [searchValue, setSearchValue] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const { data: apiKeys = [], isFetched } = useQuery(['api-keys'], async () => {
    const serviceAccounts = await sdk.serviceAccounts.list();
    const list = await sdk.apiKeys.list({ all: true, includeDeleted: true });
    return list.map(k => ({
      ...k,
      serviceAccountName: serviceAccounts.find(s => s.id === k.serviceAccountId)
        ?.name,
    }));
  });

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Input.Search
            placeholder="Filter by service account or ID"
            onChange={e => setSearchValue(e.target.value)}
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
            onChange={e => setShowDeleted(e.target.checked)}
          >
            Show deleted keys
          </Checkbox>
        </Col>
      </Row>
      <Table
        loading={!isFetched}
        columns={columns}
        rowKey="id"
        dataSource={apiKeys
          .filter(a => (showDeleted ? true : a.status === 'ACTIVE'))
          .filter(a =>
            searchValue
              ? a.serviceAccountId
                  .toString()
                  .includes(searchValue.toLowerCase()) ||
                a.id.toString().includes(searchValue.toLowerCase())
              : true
          )}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
      />
    </>
  );
}
