import React, { useState } from 'react';

import { useTranslation } from '@access-management/common/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, Tag, notification } from 'antd';
import {
  useGroups,
  usePermissions,
  useRefreshToken,
} from '@access-management/hooks';
import { isEqual } from 'lodash';

import { Icon, Button } from '@cognite/cogs.js';
import { ServiceAccount } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { stringContains } from '../Groups/utils';

function GroupTag({ id }: { id: number }) {
  const sdk = useSDK();

  const { data } = useQuery(['groups'], () => sdk.groups.list({ all: true }));
  const group = data?.find((g) => g.id === id)?.name;

  return <Tag key={id}>{group || id}</Tag>;
}

export default function EditGroups({ account }: { account: ServiceAccount }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const sdk = useSDK();
  const { refreshToken } = useRefreshToken();
  const [localList, setLocalList] = useState<number[]>(account.groups || []);
  const [editMode, setEditMode] = useState(false);
  const { data: allGroups = [] } = useGroups(true);
  const { data: canUpdate } = usePermissions('groupsAcl', 'UPDATE');
  const { mutateAsync, isLoading } = useMutation(
    async (groups: number[]) => {
      const removeGroups =
        account.groups?.filter((g) => !groups.includes(g)) || [];
      const addGroups =
        groups.filter((g) => !account.groups?.includes(g)) || [];

      await Promise.all(
        removeGroups.map((groupId) =>
          sdk.groups.removeServiceAccounts(groupId, [account.id])
        )
      );
      await Promise.all(
        addGroups.map((groupId) =>
          sdk.groups.addServiceAccounts(groupId, [account.id])
        )
      );
    },
    {
      onMutate() {
        notification.info({
          key: 'service-account-update',
          message: t('service-account-update-progress'),
        });
      },
      onSuccess() {
        client.invalidateQueries(['service-accounts']);
        client.invalidateQueries(['groups']);
        notification.success({
          key: 'service-account-update',
          message: t('service-account-update-success'),
        });
        refreshToken();
      },
      onError() {
        client.invalidateQueries(['service-accounts']);
        client.invalidateQueries(['groups']);
        notification.error({
          key: 'service-account-update',
          message: t('service-account-update-fail'),
          description: t('service-account-update-error'),
        });
      },
    }
  );

  const groups =
    account.groups && account.groups.length > 0 ? (
      account.groups.map((group) => <GroupTag key={group} id={group} />)
    ) : (
      <>{t('no-groups')}</>
    );

  const button = editMode ? (
    <Button
      size="small"
      type="primary"
      disabled={isLoading}
      icon="Checkmark"
      onClick={() => {
        if (!isEqual(account.groups, localList)) {
          mutateAsync(localList);
        }
        setEditMode(false);
      }}
    >
      {!isLoading && t('save')}
    </Button>
  ) : (
    <Button
      size="small"
      type="ghost"
      onClick={() => setEditMode(true)}
      icon="Edit"
    />
  );

  return (
    <>
      {editMode ? (
        <Select
          mode="multiple"
          style={{ width: '90%' }}
          placeholder={t('group-select')}
          defaultValue={account.groups}
          filterOption={(input, option) => stringContains(option?.title, input)}
          optionLabelProp="title"
          onChange={(e) => {
            setLocalList(e);
          }}
        >
          {allGroups
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((g) => (
              <Select.Option key={g.id} value={g.id} title={g.name}>
                {g.name}
              </Select.Option>
            ))}
        </Select>
      ) : (
        groups
      )}
      {isLoading && <Icon type="Loader" />}
      {canUpdate && button}
    </>
  );
}
