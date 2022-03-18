import React from 'react';
import { Modal, Dropdown, Menu, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from 'hooks';

export default function Actions({ id }: { id: number }) {
  const sdk = useSDK();
  const client = useQueryClient();
  const { data: canDelete } = usePermissions('apikeysAcl', 'DELETE');

  const { mutate } = useMutation(() => sdk.apiKeys.delete([id]), {
    onMutate() {
      notification.info({
        key: 'ap-keys-delete',
        message: 'Deleting API key',
      });
    },
    onSuccess() {
      notification.success({
        key: 'ap-keys-delete',
        message: 'API key deleted',
      });
      client.invalidateQueries(['api-keys']);
    },
    onError(error) {
      notification.error({
        key: 'ap-keys-delete',
        message: 'API key not deleted!',
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
          <Menu.Item
            disabled={!canDelete}
            onClick={() =>
              Modal.confirm({
                title: 'Confirm deletion',
                okText: 'Delete',
                content: (
                  <>
                    Are you sure you want to delete the API key{' '}
                    <strong>{id}</strong>
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
      <Icon style={{ cursor: 'pointer' }} type="EllipsisVertical" />
    </Dropdown>
  );
}
