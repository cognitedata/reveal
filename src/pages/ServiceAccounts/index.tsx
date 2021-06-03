import React, { useState } from 'react';

import {
  Button,
  Form,
  Col,
  Modal,
  Input,
  Row,
  Table,
  notification,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { sleep } from 'utils/utils';

import columns from './columns';

export default function ServiceAccounts() {
  const sdk = useSDK();
  const client = useQueryClient();
  const [searchValue, setSearchValue] = useState('');
  const [newName, setNewName] = useState('');
  const [showNewModal, setShowModal] = useState(false);
  const { data: createPermission } = usePermissions('usersAcl', 'CREATE');
  const { data: accounts, isFetched } = useQuery(['service-accounts'], () =>
    sdk.serviceAccounts.list()
  );
  const { mutateAsync: create } = useMutation(
    (name: string) =>
      sdk.serviceAccounts.create([{ name }]).then(() => sleep(500)),
    {
      onMutate() {
        notification.info({
          key: 'service-account-create',
          message: 'Creating service account',
        });
      },
      onSuccess() {
        notification.success({
          key: 'service-account-create',
          message: 'Service account created',
        });
        client.invalidateQueries(['service-accounts']);
      },
      onError(error) {
        notification.error({
          key: 'service-account-create',
          message: 'Service account not created!',
          description: (
            <>
              <p>An error occured when creating the service account</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          ),
        });
      },
    }
  );

  return (
    <>
      {showNewModal && (
        <Modal
          visible
          cancelText="Cancel"
          title="Create service account"
          okText="Create"
          okButtonProps={{ disabled: !newName }}
          onOk={async () => {
            await create(newName);
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
                onChange={e => setNewName(e.target.value)}
                value={newName}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      <Row justify="space-between">
        <Col>
          <Input.Search
            placeholder="Filter by name or ID"
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
          <Button
            type="primary"
            disabled={!createPermission}
            onClick={() => setShowModal(true)}
          >
            Create new service account
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
        loading={!isFetched}
        columns={columns}
        dataSource={accounts?.filter(a =>
          searchValue
            ? a.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              a.id.toString().includes(searchValue.toLowerCase())
            : true
        )}
        pagination={{ pageSize: 25, hideOnSinglePage: true }}
      />
    </>
  );
}
