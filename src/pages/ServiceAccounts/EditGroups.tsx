import React, { useState } from 'react';
import { isEqual } from 'lodash';
import { Button, Select, Tag, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import { ServiceAccount } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

function GroupTag({ id }: { id: number }) {
  const sdk = useSDK();

  const { data } = useQuery(['groups'], () => sdk.groups.list({ all: true }));
  const group = data?.find(g => g.id === id)?.name;

  return <Tag key={id}>{group || id}</Tag>;
}

export default function EditGroups({ account }: { account: ServiceAccount }) {
  const client = useQueryClient();
  const sdk = useSDK();
  const [localList, setLocalList] = useState<number[]>(account.groups || []);
  const [editMode, setEditMode] = useState(false);
  const { data: allGroups = [] } = useQuery(['groups'], () =>
    sdk.groups.list({ all: true })
  );
  const { data: canUpdate } = usePermissions('groupsAcl', 'UPDATE');
  const { mutateAsync, isLoading } = useMutation(
    async (groups: number[]) => {
      const removeGroups =
        account.groups?.filter(g => !groups.includes(g)) || [];
      const addGroups = groups.filter(g => !account.groups?.includes(g)) || [];

      await Promise.all(
        removeGroups.map(groupId =>
          sdk.groups.removeServiceAccounts(groupId, [account.id])
        )
      );
      await Promise.all(
        addGroups.map(groupId =>
          sdk.groups.addServiceAccounts(groupId, [account.id])
        )
      );
    },
    {
      onMutate() {
        notification.info({
          key: 'service-account-update',
          message: 'Update service account',
        });
      },
      onSuccess() {
        client.invalidateQueries(['service-accounts']);
        client.invalidateQueries(['groups']);
        notification.success({
          key: 'service-account-update',
          message: 'Service account updated',
        });
      },
      onError() {
        client.invalidateQueries(['service-accounts']);
        client.invalidateQueries(['groups']);
        notification.error({
          key: 'service-account-update',
          message: 'Service account not updated!',
        });
      },
    }
  );

  const groups =
    account.groups && account.groups.length > 0 ? (
      account.groups.map(group => <GroupTag key={group} id={group} />)
    ) : (
      <>No groups</>
    );

  const button = editMode ? (
    <Button
      size="small"
      type="primary"
      disabled={isLoading}
      icon={<Icon type="Check" />}
      onClick={() => {
        if (!isEqual(account.groups, localList)) {
          mutateAsync(localList);
        }
        setEditMode(false);
      }}
    >
      {!isLoading && 'Save'}
    </Button>
  ) : (
    <Button
      size="small"
      type="ghost"
      onClick={() => setEditMode(true)}
      icon={<Icon type="Edit" />}
    />
  );

  return (
    <>
      {editMode ? (
        <Select
          mode="multiple"
          style={{ width: '90%' }}
          placeholder="Select groups"
          defaultValue={account.groups}
          onChange={e => {
            setLocalList(e);
          }}
        >
          {allGroups
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => (
              <Select.Option key={g.id} value={g.id}>
                {g.name}
              </Select.Option>
            ))}
        </Select>
      ) : (
        groups
      )}
      {isLoading && <Icon type="Loading" />}
      {canUpdate && button}
    </>
  );
}
