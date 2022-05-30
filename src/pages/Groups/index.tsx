import { useSDK } from '@cognite/sdk-provider';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
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
  Tooltip,
  Typography,
} from 'antd';
import { getContainer } from 'utils/utils';
import { Group } from '@cognite/sdk';
import { useRouteMatch } from 'react-router';
import { ColumnType } from 'antd/lib/table';

import LegacyServiceAccountsWarning from 'pages/OIDC/LegacyServiceAccountsWarning';
import {
  useAuthConfiguration,
  useGroups,
  usePermissions,
  useListServiceAccounts,
} from 'hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import GroupDrawer from './GroupDrawer';
import CapabilityTag from './CapabilityTag';
import { isDeprecated, stringContains } from './utils';
import { useTranslation } from 'common/i18n';

const { Text } = Typography;

export default function Groups() {
  const { t } = useTranslation();
  const sdk = useSDK();
  const { flow } = getFlow();
  const legacyFlow = flow === 'COGNITE_AUTH';
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
  const { data: authSettings } = useAuthConfiguration();
  const { data: groups, isFetched: groupsFetched } = useGroups(true);
  const { data: serviceAccounts } = useListServiceAccounts(legacyFlow);

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
      await sdk.projects.updateProject(name, {
        update: {
          defaultGroupId: { set: defaultGroupId },
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
            {t('capability-missing-desc', {
              capability: <strong>groupsAcl:READ</strong>,
            })}
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
        if (
          id === project?.defaultGroupId &&
          authSettings?.isLegacyLoginFlowAndApiKeysEnabled
        ) {
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
                    {t('text-learn-more')}
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
      title: t('text-name'),
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
    legacyFlow
      ? {
          title: t('service-account_other'),
          dataIndex: 'id',
          align: 'center',
          render(id: number) {
            return (
              serviceAccounts?.filter((a) => a.groups?.includes(id)).length || 0
            );
          },
        }
      : false,

    {
      title: t('text-actions'),
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
                  {t('set-as-default')}
                </Menu.Item>
              )}
              <Menu.Item
                onClick={() =>
                  Modal.confirm({
                    title: t('confirm-delete'),
                    content: (
                      <>
                        {t('group-delete-confirm')} <strong>{item.name}</strong>
                        ?
                      </>
                    ),
                    okText: t('text-delete'),
                    onOk: () => deleteGroup(item.id),
                  })
                }
              >
                {t('text-delete')}
              </Menu.Item>
            </Menu>
          }
        >
          <Icon style={{ cursor: 'pointer' }} type="EllipsisVertical" />
        </Dropdown>
      ),
    },
  ].filter(Boolean) as ColumnType<Group>[];

  return (
    <>
      {!authSettings?.isLegacyLoginFlowAndApiKeysEnabled &&
      serviceAccounts?.length ? (
        <LegacyServiceAccountsWarning accounts={serviceAccounts} />
      ) : null}
      <Row justify="space-between">
        <Col>
          <Input.Search
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
          >
            {t('group-create-label')}
          </Button>
        </Col>
      </Row>
      <Table
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
