import { useSDK } from '@cognite/sdk-provider';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Button } from '@cognite/cogs.js';
import { Col, Form, Input, Modal, Row, Table, notification } from 'antd';
import { getContainer } from 'utils/utils';
import columns from './columns';
import { stringContains } from '../Groups/utils';

export default function SecurityCategories() {
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
          message: 'Category created',
        });
        client.invalidateQueries(['security-categories']);
      },
      onError(error) {
        notification.error({
          key: 'category-creation',
          message: 'Category not created!',
          description: (
            <>
              <p>An error occured when creating the security category</p>
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
      {showModal && (
        <Modal
          visible
          cancelText="Cancel"
          title="Create security category"
          okText="Create"
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
            <Form.Item name="name" label="Name">
              <Input
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
            placeholder="Filter security categories by name/ID"
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
          <Button type="primary" onClick={() => setShowModal(true)}>
            Create new security category
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
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
