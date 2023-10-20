import React, { useState } from 'react';

import { useTranslation } from '@access-management/common/i18n';
import { AccessConfigurationWarning } from '@access-management/pages/components/AccessConfigurationWarning';
import { getContainer } from '@access-management/utils/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Col, Form, Input, Modal, Row, Table, notification } from 'antd';

import { Button } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { stringContains } from '../Groups/utils';

import columns from './columns';

export default function SecurityCategories() {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();
  const { data, isFetched } = useQuery(
    ['security-categories'],
    async () => (await sdk.securityCategories.list())?.items
  );

  const { mutateAsync: createCategory } = useMutation(
    (name: string) => sdk.securityCategories.create([{ name }]),
    {
      onSuccess() {
        notification.success({
          key: 'category-creation',
          message: t('create-category-success'),
        });
        client.invalidateQueries(['security-categories']);
      },
      onError(error) {
        notification.error({
          key: 'category-creation',
          message: t('create-category-fail'),
          description: (
            <>
              <p>{t('create-category-error')}</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          ),
        });
      },
    }
  );

  const [searchValue, setSearchValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <>
      <AccessConfigurationWarning />
      {showModal && (
        <Modal
          visible
          cancelText={t('cancel')}
          title={t('create-security-category')}
          okText={t('create')}
          okButtonProps={{ disabled: !newName }}
          onOk={async () => {
            await createCategory(newName);
            setNewName('');
            setShowModal(false);
          }}
          onCancel={() => {
            setNewName('');
            setShowModal(false);
          }}
        >
          <Form layout="horizontal">
            <Form.Item name="name" label={t('name')}>
              <Input
                data-testid="access-management-create-security-category-input"
                onChange={(e) => setNewName(e.target.value)}
                value={newName}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      <Row justify="space-between">
        <Col>
          <Input.Search
            data-testid="access-management-security-categories-search"
            placeholder={t('create-category-filter-placeholder')}
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
          <Button
            type="primary"
            onClick={() => setShowModal(true)}
            data-testid="access-management-create-security-category-button"
          >
            {t('create-new-security-category')}
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
        data-testid="access-management-security-categories-table"
        loading={!isFetched}
        columns={columns}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
        dataSource={data?.filter(
          (s) =>
            stringContains(s.name, searchValue) ||
            stringContains(String(s.id), searchValue)
        )}
        style={{ marginTop: '20px' }}
        getPopupContainer={getContainer}
      />
    </>
  );
}