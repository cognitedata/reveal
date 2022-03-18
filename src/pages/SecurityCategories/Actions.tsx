import React from 'react';
import { Menu, Modal, Dropdown, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

export default function Actions({ id }: { id: number }) {
  const sdk = useSDK();
  const client = useQueryClient();
  const { mutateAsync: deleteCategory } = useMutation(
    () => sdk.securityCategories.delete([id]),
    {
      onMutate() {
        notification.info({
          key: 'category-delete',
          message: 'Deleting category',
        });
      },
      onSuccess() {
        notification.success({
          key: 'category-delete',
          message: 'Category deleted',
        });
        client.invalidateQueries(['security-categories']);
      },
      onError(error) {
        notification.error({
          key: 'category-delete',
          message: 'Category not deleted!',
          description: (
            <>
              <p>An error occured when deleting the security category</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          ),
        });
      },
    }
  );

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      overlay={
        <Menu>
          <Menu.Item
            onClick={() =>
              Modal.confirm({
                title: 'Confirm deletion',
                okText: 'Delete',
                content: (
                  <>
                    Are you sure you want to delete the group{' '}
                    <strong>{id}</strong>?
                  </>
                ),
                onOk: () => deleteCategory(),
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
