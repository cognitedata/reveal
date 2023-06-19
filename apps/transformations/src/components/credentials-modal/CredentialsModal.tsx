import { useTranslation } from '@transformations/common';
import CredentialsForm, {
  CredentialsFormValues,
  validateCredentialsForm,
} from '@transformations/components/credentials-form';
import {
  CLEAR_CREDENTIALS,
  useUpdateTransformation,
  useUpdateTransformationSession,
} from '@transformations/hooks';
import {
  shouldUseApiKeysAsDestinationCredentials,
  CredentialsModalProps,
} from '@transformations/utils';
import { notification } from 'antd';
import { useFormik } from 'formik';

import { getProject } from '@cognite/cdf-utilities';
import { Modal } from '@cognite/cogs.js';

import ApiKeyModal from './ApiKeyModal';
import ConfiguredCredentials from './ConfiguredCredentials';

export default function CredentialsModal({
  transformation,
  visible,
  onCancel,
}: CredentialsModalProps) {
  const { t } = useTranslation();

  const shouldUseApiKeys =
    shouldUseApiKeysAsDestinationCredentials(transformation);

  const {
    destinationSession,
    hasDestinationApiKey,
    hasDestinationOidcCredentials,
    hasSourceApiKey,
    hasSourceOidcCredentials,
    sourceSession,
  } = transformation;

  const hasApiKey = hasSourceApiKey && hasDestinationApiKey;
  const hasOidcCredentials =
    hasSourceOidcCredentials && hasDestinationOidcCredentials;
  const hasSession = !!sourceSession && !!destinationSession;

  const hasCredentials = hasApiKey || hasOidcCredentials || hasSession;

  const { mutateAsync: updateTransformationCredentials } =
    useUpdateTransformationSession({
      onSuccess() {
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

  const { mutateAsync } = useUpdateTransformation();

  const credentialsForm = useFormik<CredentialsFormValues>({
    initialValues: {
      method: 'standard',
      readProject: getProject(),
      writeProject: getProject(),
    },
    onSubmit: (values) => {
      if (values.method === 'standard') {
        updateTransformationCredentials({
          destinationClientId: values.readClientId!,
          destinationSecret: values.readClientSecret!,
          destinationProject: getProject(),
          sourceClientId: values.readClientId!,
          sourceSecret: values.readClientSecret!,
          sourceProject: getProject(),
          transformationId: transformation.id,
        });
      } else {
        updateTransformationCredentials({
          destinationClientId: values.writeClientId!,
          destinationSecret: values.writeClientSecret!,
          destinationProject: values.writeProject!,
          sourceClientId: values.readClientId!,
          sourceSecret: values.readClientSecret!,
          sourceProject: values.readProject!,
          transformationId: transformation.id,
        });
      }
    },
    validate: (values) => validateCredentialsForm(values, t),
    validateOnChange: false,
  });

  const handleSubmit = () => {
    credentialsForm.handleSubmit();
  };

  if (!visible) {
    return null;
  }

  if (shouldUseApiKeys) {
    return <ApiKeyModal transformation={transformation} onCancel={onCancel} />;
  }

  return (
    <Modal
      additionalActions={
        hasCredentials
          ? {
              children: t('remove-credentials'),
              icon: undefined,
              iconPlacement: undefined,
              onClick: () => {
                mutateAsync({
                  id: transformation.id,
                  update: { ...CLEAR_CREDENTIALS },
                });
              },
            }
          : undefined
      }
      onOk={hasCredentials ? onCancel : handleSubmit}
      okText={hasCredentials ? t('done') : t('save')}
      cancelText={t('close')}
      onCancel={onCancel}
      title={t('client-credentials')}
      visible
    >
      {hasCredentials ? (
        <ConfiguredCredentials transformation={transformation} />
      ) : (
        <CredentialsForm formik={credentialsForm} />
      )}
    </Modal>
  );
}
