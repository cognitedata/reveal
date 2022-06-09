import React from 'react';
import { Modal, Dropdown, Menu, Typography, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions, useRefreshToken } from 'hooks';
import { useTranslation } from 'common/i18n';

const { Text } = Typography;

export default function Actions({ id, name }: { id: number; name: string }) {
  const { t } = useTranslation();
  const sdk = useSDK();
  const client = useQueryClient();
  const { refreshToken } = useRefreshToken();
  const { data: hasPermission } = usePermissions('usersAcl', 'DELETE');
  const { mutateAsync: generateNewKey } = useMutation(
    () => sdk.apiKeys.create([{ serviceAccountId: id }]),
    {
      onSuccess(data) {
        Modal.success({
          title: t('create-api-key-success'),
          width: 300,
          content: (
            <div style={{ border: '1px solid grey', margin: 5, padding: 5 }}>
              <Text
                copyable={{ text: `${data[0].value || ''}`, tooltips: false }}
              >
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
        message: t('service-account-delete-progress'),
      });
    },
    onSuccess() {
      notification.success({
        key: 'service-account-delete',
        message: t('service-account-delete-success'),
      });
      client.invalidateQueries(['service-accounts']);
      refreshToken();
    },
    onError(error) {
      notification.error({
        key: 'service-account-delete',
        message: t('service-account-delete-fail'),
        description: (
          <>
            <p>{t('service-account-delete-error')}</p>
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
            {t('generate-api-key')}
          </Menu.Item>
          <Menu.Item
            disabled={!hasPermission}
            onClick={() =>
              Modal.confirm({
                title: t('confirm-delete'),
                okText: t('delete'),
                content: (
                  <>
                    {t('confirm-delete-service-account')}
                    <strong>{name}</strong>?
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
