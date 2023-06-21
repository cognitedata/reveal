import { useState } from 'react';

import { useTranslation } from '@transformations/common';
import { useUpdateTransformationApiKey } from '@transformations/hooks';
import ApiKeyCredentialsForm from '@transformations/pages/transformation-details/ApiKeyCredentialsForm';
import FormCollapse from '@transformations/pages/transformation-details/FormCollapse';
import { CredentialsModalProps } from '@transformations/utils';
import { Alert, Checkbox, notification } from 'antd';

import { Flex, Icon, Title, Modal } from '@cognite/cogs.js';

export default function ApiCredentialsModal({
  onCancel,
  transformation,
}: Omit<CredentialsModalProps, 'visible'>): JSX.Element {
  const { t } = useTranslation();

  const [applyToBoth, setBoth] = useState(true);

  const [sourceApiKey, setSourceApiKey] = useState('');
  const [destinationApiKey, setDestinationApiKey] = useState('');

  const resetFormState = () => {
    setSourceApiKey('');
    setDestinationApiKey('');
  };

  const canSave = !!sourceApiKey && (applyToBoth || !!destinationApiKey);

  const hasAnyCredentials =
    transformation.hasSourceApiKey || transformation.hasDestinationApiKey;

  const { mutate: updateTransformation, isLoading } =
    useUpdateTransformationApiKey({
      onSuccess() {
        resetFormState();
        notification.success({
          message: t('notification-success-transformation-update'),
          key: 'credentials-update',
        });
        onCancel();
      },
      onError(e: any) {
        notification.error({
          message: e.toString(),
          key: 'credentials-update',
        });
      },
    });

  return (
    <Modal
      icon="Close"
      onCancel={onCancel}
      cancelText={t('close')}
      okDisabled={!canSave || isLoading}
      onOk={() =>
        updateTransformation({
          transformationId: transformation.id,
          sourceApiKey: sourceApiKey,
          destinationApiKey: applyToBoth ? sourceApiKey : destinationApiKey,
        })
      }
      okText={t('save')}
      title={hasAnyCredentials ? t('update-credentials') : t('set-credentials')}
      visible
      additionalActions={[
        {
          icon: 'Delete',
          iconPlacement: 'left',
          children: t('credentials-delete'),
          onClick: () =>
            updateTransformation({
              transformationId: transformation.id,
              setNull: true,
              sourceApiKey: sourceApiKey,
              destinationApiKey: destinationApiKey,
            }),
        },
      ]}
    >
      <Flex direction="column" gap={16}>
        {hasAnyCredentials ? (
          <Alert
            icon={
              <div style={{ height: 36 }}>
                <Icon type="WarningFilled" />
              </div>
            }
            showIcon
            message={t('credentials-set-warning')}
            type="warning"
          />
        ) : (
          <Alert
            icon={
              <div style={{ height: 36 }}>
                <Icon type="InfoFilled" />
              </div>
            }
            showIcon
            message={t('you-need-to-set-credentials')}
            type="info"
          />
        )}
        <Flex direction="column" gap={8}>
          {applyToBoth ? (
            <>
              <Title level={6}>{t('api-read-write-key')}</Title>
              <FormCollapse
                configuredMessage={t('configured')}
                isConfigured={hasAnyCredentials}
                isOpenByDefault={!hasAnyCredentials}
              >
                {() => (
                  <ApiKeyCredentialsForm
                    apiKey={sourceApiKey}
                    setApiKey={(s) => setSourceApiKey(s)}
                  />
                )}
              </FormCollapse>
            </>
          ) : (
            <>
              <Title level={6}>{t('api-read-key')}</Title>
              <FormCollapse
                configuredMessage={t('configured')}
                isConfigured={hasAnyCredentials}
                isOpenByDefault={!hasAnyCredentials}
              >
                {() => (
                  <ApiKeyCredentialsForm
                    apiKey={sourceApiKey}
                    setApiKey={(s) => setSourceApiKey(s)}
                  />
                )}
              </FormCollapse>
              <Title level={6}>{t('api-read-key')}</Title>
              <FormCollapse
                configuredMessage={t('configured')}
                isConfigured={hasAnyCredentials}
                isOpenByDefault={!hasAnyCredentials}
              >
                {() => (
                  <ApiKeyCredentialsForm
                    apiKey={destinationApiKey}
                    setApiKey={(s) => setDestinationApiKey(s)}
                  />
                )}
              </FormCollapse>
            </>
          )}
        </Flex>
        <Flex>
          <Checkbox
            checked={applyToBoth}
            onChange={(e) => setBoth(e.target.checked)}
          >
            {t('apply-for-both-read-and-write')}
          </Checkbox>
        </Flex>
      </Flex>
    </Modal>
  );
}
