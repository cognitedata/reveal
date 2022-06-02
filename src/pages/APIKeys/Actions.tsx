import React from 'react';
import { Modal, Dropdown, Menu, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from 'hooks';
import { useTranslation } from 'common/i18n';

export default function Actions({ id }: { id: number }) {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();
  const { data: canDelete } = usePermissions('apikeysAcl', 'DELETE');

  const { mutate } = useMutation(() => sdk.apiKeys.delete([id]), {
    onMutate() {
      notification.info({
        key: 'ap-keys-delete',
        message: t('delete-api-key'),
      });
    },
    onSuccess() {
      notification.success({
        key: 'ap-keys-delete',
        message: t('delete-api-key-success'),
      });
      client.invalidateQueries(['api-keys']);
    },
    onError(error) {
      notification.error({
        key: 'ap-keys-delete',
        message: t('delete-api-key-failed'),
        description: (
          <>
            <p>{t('delete-api-key-error')}</p>
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
                title: t('confirm-delete'),
                okText: t('delete'),
                content: (
                  <>
                    {t('confirm-delete-api')} <strong>{id}</strong>
                  </>
                ),
                onOk: () => mutate(),
              })
            }
          >
            {t('delete')}
          </Menu.Item>
        </Menu>
      }
    >
      <Icon style={{ cursor: 'pointer' }} type="EllipsisVertical" />
    </Dropdown>
  );
}
