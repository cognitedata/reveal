import React from 'react';
import { Menu, Modal, Dropdown, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { useTranslation } from 'common/i18n';

export default function Actions({ id }: { id: number }) {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();
  const { mutateAsync: deleteCategory } = useMutation(
    () => sdk.securityCategories.delete([id]),
    {
      onMutate() {
        notification.info({
          key: 'category-delete',
          message: t('category-delete-progress'),
        });
      },
      onSuccess() {
        notification.success({
          key: 'category-delete',
          message: t('category-delete-success'),
        });
        client.invalidateQueries(['security-categories']);
      },
      onError(error) {
        notification.error({
          key: 'category-delete',
          message: t('category-delete-fail'),
          description: (
            <>
              <p>{t('category-delete-error')}</p>
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
                title: t('confirm-delete'),
                okText: t('delete'),
                content: (
                  <>
                    {t('confirm-delete-group')} <strong>{id}</strong>?
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
