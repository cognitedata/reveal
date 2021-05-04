import { useSDK } from '@cognite/sdk-provider';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Button, Icon } from '@cognite/cogs.js';
import {
  notification,
  Alert,
  Col,
  Dropdown,
  Input,
  Menu,
  Modal,
  Row,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { getContainer } from 'utils/utils';
import { Group } from '@cognite/sdk';
import { useRouteMatch } from 'react-router';
import { ColumnType } from 'antd/lib/table';

import GroupDrawer from './GroupDrawer';

const { Text } = Typography;

export default function Groups() {
  const sdk = useSDK();
  const legacyFlow = sdk.getOAuthFlowType() === 'CDF_OAUTH';
  const client = useQueryClient();

  const [showNewGroupDrawer, setShowNew] = useState(false);
  const [showEditGroupDrawer, setShowEdit] = useState<Group | undefined>();

  const [searchValue, setSearchValue] = useState('');
  const match = useRouteMatch<{ tenant: string }>('/:tenant');
  const { data: readPermission, isFetched: readPermFetched } = usePermissions(
    'groupsAcl',
    'LIST'
  );
  const { data: createPermission } = usePermissions('groupsAcl', 'CREATE');

  // API is a bit slow, so keep a local copy
  const [localDefaultGroup, setLocalDefaultGroup] = useState<
    number | undefined
  >();

  const { data: project, isFetched: projectFetched } = useQuery(
    ['project', match?.params.tenant],
    () => sdk.projects.retrieve(match?.params.tenant!),
    {
      enabled: !!match?.params.tenant,
      refetchInterval: localDefaultGroup ? 1000 : false,
    }
  );
  const { data: groups, isFetched: groupsFetched } = useQuery(
    ['groups', 'all'],
    () => sdk.groups.list({ all: true })
  );

  const { data: serviceAccounts } = useQuery(
    ['service-accounts'],
    () => sdk.serviceAccounts.list(),
    { enabled: legacyFlow }
  );

  useEffect(() => {
    if (project?.defaultGroupId === localDefaultGroup) {
      setLocalDefaultGroup(undefined);
    }
  }, [project, localDefaultGroup]);

  const { mutate: setDefaultGroup } = useMutation(
    async ({
      name,
      defaultGroupId,
    }: {
      name: string;
      defaultGroupId: number;
    }) => {
      await sdk.put(`api/playground/projects/${name}/defaultGroup`, {
        data: {
          items: [defaultGroupId],
        },
      });
    },
    {
      onSuccess(_, { name }) {
        client.invalidateQueries(['project', name]);
      },
      onMutate({ defaultGroupId }) {
        setLocalDefaultGroup(defaultGroupId);
      },
    }
  );

  const { mutateAsync: deleteGroup } = useMutation(
    (id: number) => sdk.groups.delete([id]),
    {
      onMutate() {
        notification.info({
          key: 'group-delete',
          message: 'Deleting group',
        });
      },
      onSuccess() {
        notification.success({
          key: 'group-delete',
          message: 'Group deleted',
        });
        client.invalidateQueries(['groups']);
      },
      onError(error) {
        notification.error({
          key: 'group-delete',
          message: 'Group not deleted!',
          description: (
            <>
              <p>An error occured when deleting the group</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          ),
        });
      },
    }
  );

  if (!readPermission && readPermFetched) {
    return (
      <Alert
        type="warning"
        message="Missing capability!"
        description={
          <>
            You do not have the necessary <strong>groupsAcl:READ</strong> to
            list the groups
          </>
        }
      />
    );
  }

  const columns: ColumnType<Group>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 240,
      sorter: (a?: Group, b?: Group) => {
        return a && b ? a.id - b.id : -1;
      },
      render(id: number) {
        let extra;
        if (id === project?.defaultGroupId) {
          extra = (
            <Tooltip
              key={id}
              placement="topLeft"
              title={
                <p>
                  This is the default group for your project. Users are
                  dynamically placed in the default group when their user
                  account or service account does not belong to another group.{' '}
                  <a
                    href="https://docs.cognite.com/dev/guides/iam/authorization.html#the-default-group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </a>
                </p>
              }
              getPopupContainer={getContainer}
            >
              <Icon
                type="Checkmark"
                style={{ marginLeft: '10px', color: 'green' }}
              />
            </Tooltip>
          );
        }
        return (
          <>
            <Text data-testid="group-cat-id" copyable={{ text: `${id}` }}>
              {id}
            </Text>
            {extra}
          </>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a?: Group, b?: Group) => {
        return a && b ? a.name.localeCompare(b.name) : -1;
      },
    },
    {
      title: 'Capabilities',
      key: 'capability',
      render(g: Group) {
        if (g.capabilities && g.capabilities.length > 0) {
          return g.capabilities.map(c => {
            const acl: string = Object.keys(c)[0]!;
            // @ts-ignore
            const { actions } = c[acl];
            // @ts-ignore
            const dataset: boolean = Object.keys(c[acl].scope || {}).includes(
              'datasetScope'
            );

            return actions.map((a: string) => (
              <Tag key={`${acl.replace('Acl', '')}:${a.toLowerCase()}`}>
                {dataset && (
                  <span
                    style={{
                      backgroundColor: 'var(--cogs-primary)',
                      color: 'white',
                      padding: '0 4px',
                      borderRadius: 2,
                    }}
                  >
                    Scope: Data sets
                  </span>
                )}
                {` ${acl.replace('Acl', '')}:${a.toLowerCase()}`}
              </Tag>
            ));
          });
        }

        return <>No permissions specified</>;
      },
    },
    {
      title: 'Service accounts',
      dataIndex: 'id',
      align: 'center',
      render(id: number) {
        return serviceAccounts?.filter(a => a.groups?.includes(id)).length || 0;
      },
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (item: Group) => (
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          overlay={
            <Menu>
              <Menu.Item onClick={() => setShowEdit(item)}>Edit</Menu.Item>
              {legacyFlow && item.id !== project?.defaultGroupId && (
                <Menu.Item
                  onClick={() =>
                    project?.name &&
                    setDefaultGroup({
                      name: project?.name,
                      defaultGroupId: item.id,
                    })
                  }
                >
                  Set as default group
                </Menu.Item>
              )}
              <Menu.Item
                onClick={() =>
                  Modal.confirm({
                    title: 'Confirm group deletion',
                    content: (
                      <>
                        Do you want to delete the group{' '}
                        <strong>{item.name}</strong>?{' '}
                      </>
                    ),
                    okText: 'Delete',
                    onOk: () => deleteGroup(item.id),
                  })
                }
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Icon
            style={{ cursor: 'pointer' }}
            type="MoreOverflowEllipsisVertical"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Input.Search
            placeholder="Filter groups by name, ID or capability"
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
            onClick={() => setShowNew(true)}
          >
            Create new group
          </Button>
        </Col>
      </Row>
      <Table
        rowKey="id"
        loading={!projectFetched || !groupsFetched}
        columns={columns}
        dataSource={groups?.filter(
          s =>
            s.name.toLowerCase().includes(searchValue) ||
            s.id.toString().includes(searchValue) ||
            s.capabilities?.find(c => Object.keys(c)[0]!.includes(searchValue))
        )}
        style={{ marginTop: '20px' }}
        getPopupContainer={getContainer}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
      />
      {showNewGroupDrawer && <GroupDrawer onClose={() => setShowNew(false)} />}
      {showEditGroupDrawer && (
        <GroupDrawer
          group={showEditGroupDrawer}
          onClose={() => setShowEdit(undefined)}
        />
      )}
    </>
  );
}
