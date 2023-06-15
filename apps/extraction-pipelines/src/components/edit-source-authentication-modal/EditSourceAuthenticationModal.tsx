import React from 'react';

import { useTranslation } from '@extraction-pipelines/common';
import {
  BaseMQTTSource,
  MQTTSourceWithJobMetrics,
  useEditMQTTSource,
} from '@extraction-pipelines/hooks/hostedExtractors';
import { notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { Flex, InputExp, Modal, ModalProps } from '@cognite/cogs.js';

type EditSourceAuthenticationModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

type EditMQTTSourceAuthenticationFormValues = Partial<
  Pick<BaseMQTTSource, 'username'>
> & { password?: string };

export const EditSourceAuthenticationModal = ({
  onCancel,
  source,
  visible,
}: EditSourceAuthenticationModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: editMQTTSource } = useEditMQTTSource({
    onSuccess: () => {
      notification.success({
        message: t('notification-auth-source-update-success'),
        key: 'create-source',
      });
      onCancel();
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'create-source',
      });
    },
  });

  const handleValidate = (
    values: EditMQTTSourceAuthenticationFormValues
  ): FormikErrors<EditMQTTSourceAuthenticationFormValues> => {
    const errors: FormikErrors<EditMQTTSourceAuthenticationFormValues> = {};

    if (!values.username) {
      errors.username = t('validation-error-field-required');
    }
    if (!values.password) {
      errors.password = t('validation-error-field-required');
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<EditMQTTSourceAuthenticationFormValues>({
      initialValues: {
        username: source.username,
      },
      onSubmit: (val) => {
        if (val.username && val.password) {
          editMQTTSource({
            externalId: source.externalId,
            type: source.type,
            update: {
              username: {
                set: val.username,
              },
              password: {
                set: val.password,
              },
            },
          });
        }
      },
      validate: handleValidate,
      validateOnBlur: false,
      validateOnChange: false,
    });

  return (
    <Modal
      onCancel={onCancel}
      okText={t('edit')}
      onOk={handleSubmit}
      title={t('edit-source-authentication')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-username'),
          }}
          onChange={(e) => setFieldValue('username', e.target.value)}
          placeholder={t('form-username-placeholder')}
          status={errors.username ? 'critical' : undefined}
          statusText={errors.username}
          value={values.username}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-password'),
          }}
          onChange={(e) => setFieldValue('password', e.target.value)}
          placeholder={t('form-password-placeholder')}
          status={errors.password ? 'critical' : undefined}
          statusText={errors.password}
          type="password"
          value={values.password}
        />
      </Flex>
    </Modal>
  );
};
