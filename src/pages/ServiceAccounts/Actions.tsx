import React from 'react';
import { Modal, Dropdown, Menu, Typography, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions, useRefreshToken } from 'hooks';

const { Text } = Typography;

export default function Actions({ id, name }: { id: number; name: string }) {
  const sdk = useSDK();
  const client = useQueryClient();
  const { refreshToken } = useRefreshToken();
  const { data: hasPermission } = usePermissions('usersAcl', 'DELETE');
  const { mutateAsync: generateNewKey } = useMutation(
    () => sdk.apiKeys.create([{ serviceAccountId: id }]),
    {
      onSuccess(data) {
        Modal.success({
          title: 'API key created',
          width: 300,
          content: (
            <div style={{ border: '1px solid grey', margin: 5, padding: 5 }}>
              <Text copyable={{ text: `${data[0].value || ''}` }}>
                {data[0].value}
              </Text>
            </div>
          ),
        });
      },
    }
  );
  const { mutate } = useMutation(() => sdk.serviceAccounts.delete([id]), {
    onMutate() {
      notification.info({
        key: 'service-account-delete',
        message: 'Deleting service account',
      });
    },
    onSuccess() {
      notification.success({
        key: 'service-account-delete',
        message: 'Service account deleted',
      });
      client.invalidateQueries(['service-accounts']);
      refreshToken();
    },
    onError(error) {
      notification.error({
        key: 'service-account-delete',
        message: 'Service account not deleted!',
        description: (
          <>
            <p>An error occured when deleting the service account</p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </>
        ),
      });
    },
  });

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      overlay={
        <Menu>
          <Menu.Item onClick={() => generateNewKey()}>
            Generate new key
          </Menu.Item>
          <Menu.Item
            disabled={!hasPermission}
            onClick={() =>
              Modal.confirm({
                title: 'Confirm deletion',
                okText: 'Delete',
                content: (
                  <>
                    Are you sure you want to delete the service account{' '}
                    <strong>{name}</strong>?
                  </>
                ),
                onOk: () => mutate(),
              })
            }
          >
            Delete
          </Menu.Item>
        </Menu>
      }
    >
      <Icon style={{ cursor: 'pointer' }} type="MoreOverflowEllipsisVertical" />
    </Dropdown>
  );
}
