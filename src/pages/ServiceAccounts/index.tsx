import React, { useState } from 'react';

import {
  Button,
  Form,
  Col,
  Modal,
  Input,
  Select,
  Row,
  Table,
  notification,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import { sleep } from 'utils/utils';

import { useGroups, usePermissions, useRefreshToken } from 'hooks';
import LegacyLoginFlowWarning from 'pages/IDP/LegacyLoginFlowWarning';
import columns from './columns';
import { stringContains } from '../Groups/utils';

const { Option } = Select;

export default function ServiceAccounts() {
  const sdk = useSDK();
  const client = useQueryClient();
  const { refreshToken } = useRefreshToken();
  const [searchValue, setSearchValue] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroups, setNewGroups] = useState([]);
  const [showNewModal, setShowModal] = useState(false);
  const { data: createPermission } = usePermissions('usersAcl', 'CREATE');
  const { data: accounts, isFetched } = useQuery(['service-accounts'], () =>
    sdk.serviceAccounts.list()
  );
  const { data: allGroups = [] } = useGroups(true);
  const { mutateAsync: create } = useMutation(
    ({ name, groups }: { name: string; groups: number[] }) =>
      sdk.serviceAccounts.create([{ name, groups }]).then(() => sleep(500)),
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
        refreshToken();
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
      <LegacyLoginFlowWarning />
      {showNewModal && (
        <Modal
          visible
          cancelText="Cancel"
          title="Create service account"
          okText="Create"
          okButtonProps={{ disabled: !newName }}
          onOk={async () => {
            await create({ name: newName, groups: newGroups });
            setNewName('');
            setNewGroups([]);
            setShowModal(false);
          }}
          onCancel={() => {
            setNewName('');
            setNewGroups([]);
            setShowModal(false);
          }}
        >
          <Form
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item name="name" label="Name">
              <Input
                onChange={(e) => setNewName(e.target.value)}
                value={newName}
              />
            </Form.Item>
            <Form.Item name="groups" label="Groups">
              <Select
                mode="multiple"
                defaultValue={[]}
                onChange={(ids) => setNewGroups(ids)}
                filterOption={(input, option) =>
                  stringContains(option?.title, input)
                }
              >
                {allGroups.map((g) => (
                  <Option key={g.id} value={g.id} title={g.name}>
                    {g.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
      <Row justify="space-between">
        <Col>
          <Input.Search
            placeholder="Filter by name, ID, group name or capability"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            allowClear
            style={{
              width: '400px',
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
        dataSource={accounts?.filter(
          (a) =>
            stringContains(a.name, searchValue) ||
            stringContains(String(a.id), searchValue) ||
            allGroups
              .filter((g) => a.groups?.includes(g.id))
              .find(
                (grp) =>
                  stringContains(grp.name, searchValue) ||
                  grp.capabilities?.find((cap) =>
                    stringContains(Object.keys(cap)[0]!, searchValue)
                  )
              )
        )}
        pagination={{ pageSize: 25, hideOnSinglePage: true }}
      />
    </>
  );
}
