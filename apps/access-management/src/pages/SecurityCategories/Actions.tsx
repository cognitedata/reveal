import React from 'react';

import { useTranslation } from '@access-management/common/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, Modal, Dropdown, notification } from 'antd';

import { Icon } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

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
            data-testid="access-management-delete-security-category-button"
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
      <Icon css={{ cursor: 'pointer' }} type="EllipsisVertical" />
    </Dropdown>
  );
}
