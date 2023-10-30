import { useEffect, useState } from 'react';

import { useTranslation } from '@access-management/common/i18n';
import { useGroups, usePermissions } from '@access-management/hooks';
import { AccessConfigurationWarning } from '@access-management/pages/components/AccessConfigurationWarning';
import { getContainer } from '@access-management/utils/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  Tooltip,
  Typography,
} from 'antd';
import { ColumnType } from 'antd/lib/table';

import { getProject } from '@cognite/cdf-utilities';
import { Button, Icon } from '@cognite/cogs.js';
import { Group } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import CapabilityTag from './CapabilityTag';
import GroupDrawer from './GroupDrawer';
import { isDeprecated, stringContains } from './utils';

const { Text } = Typography;

export default function Groups() {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();

  const [showNewGroupDrawer, setShowNew] = useState(false);
  const [showEditGroupDrawer, setShowEdit] = useState<Group | undefined>();

  const [searchValue, setSearchValue] = useState('');
  const tenant = getProject();
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
    ['project', tenant],
    () => sdk.projects.retrieve(tenant!),
    {
      enabled: !!tenant,
      refetchInterval: localDefaultGroup ? 1000 : false,
    }
  );

  const { data: groups, isFetched: groupsFetched } = useGroups(true);

  useEffect(() => {
    if (project?.defaultGroupId === localDefaultGroup) {
      setLocalDefaultGroup(undefined);
    }
  }, [project, localDefaultGroup]);

  const { mutateAsync: deleteGroup } = useMutation(
    (id: number) => sdk.groups.delete([id]),
    {
      onMutate() {
        notification.info({
          key: 'group-delete',
          message: t('group-delete'),
        });
      },
      onSuccess() {
        notification.success({
          key: 'group-delete',
          message: t('group-delete-success'),
        });
        client.invalidateQueries(['groups']);
      },
      onError(error) {
        notification.error({
          key: 'group-delete',
          message: t('group-delete-fail'),
          description: (
            <>
              <p>{t('group-delete-error')}</p>
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
        message={t('capability-missing')}
        description={
          <>
            {t('capability-missing-desc')} <strong>groupsAcl:READ</strong>{' '}
            {t('capability-missing-desc-more')}
          </>
        }
      />
    );
  }

  const columns: ColumnType<Group>[] = [
    {
      title: t('id'),
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
                  {t('id-info')}{' '}
                  <a
                    href="https://docs.cognite.com/dev/guides/iam/authorization.html#the-default-group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('learn-more')}
                  </a>
                </p>
              }
              getPopupContainer={getContainer}
            >
              <Icon
                type="Checkmark"
                css={{ marginLeft: '10px', color: 'green' }}
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
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a?: Group, b?: Group) => {
        return a && b ? a.name.localeCompare(b.name) : -1;
      },
    },
    {
      title: t('capabilities'),
      key: 'capability',
      render(g: Group) {
        if (g.capabilities && g.capabilities.length > 0) {
          return g.capabilities
            .filter(isDeprecated)
            .map((c) => <CapabilityTag capability={c} />);
        }

        return <>{t('capabilities-no-permission-specified')}</>;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (item: Group) => (
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          overlay={
            <Menu>
              <Menu.Item
                // @ts-ignore I added editable without a custom type; it's going to take too long
                disabled={!item.editable}
                onClick={() => setShowEdit(item)}
                data-testid="access-management-edit-group-button"
              >
                Edit
              </Menu.Item>
              <Menu.Item
                data-testid="access-management-delete-group-button"
                onClick={() =>
                  Modal.confirm({
                    title: t('confirm-delete'),
                    content: (
                      <>
                        {t('group-delete-confirm')} <strong>{item.name}</strong>
                        ?
                      </>
                    ),
                    okText: (
                      <div data-testid="access-management-confirm-delete-group-button">
                        {t('delete')}
                      </div>
                    ),
                    onOk: () => deleteGroup(item.id),
                  })
                }
              >
                {t('delete')}
              </Menu.Item>
            </Menu>
          }
        >
          <Icon css={{ cursor: 'pointer' }} type="EllipsisVertical" />
        </Dropdown>
      ),
    },
  ].filter(Boolean) as ColumnType<Group>[];

  return (
    <>
      <AccessConfigurationWarning />
      <Row justify="space-between">
        <Col>
          <Input.Search
            data-testid="access-management-group-search"
            placeholder={t('group-filter-placeholder')}
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
            disabled={!createPermission}
            onClick={() => setShowNew(true)}
            data-testid="access-management-create-group-button"
          >
            {t('group-create-label')}
          </Button>
        </Col>
      </Row>
      <Table
        data-testid="access-management-groups-table"
        rowKey="id"
        loading={!projectFetched || !groupsFetched}
        columns={columns}
        dataSource={groups?.filter(
          (s) =>
            stringContains(s.name, searchValue) ||
            stringContains(String(s.id), searchValue) ||
            s.capabilities?.find((c) =>
              stringContains(Object.keys(c)[0]!, searchValue)
            )
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
