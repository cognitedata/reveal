import React from 'react';

import { notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { Checkbox, Flex, InputExp, Modal, ModalProps } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  BaseMQTTSource,
  MQTTSourceWithJobMetrics,
  useEditMQTTSource,
} from '../../hooks/hostedExtractors';

type EditSourceDetailsModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

type EditMQTTSourceFormValues = Partial<
  Pick<BaseMQTTSource, 'host' | 'port' | 'useTls'>
>;

export const EditSourceDetailsModal = ({
  onCancel,
  source,
  visible,
}: EditSourceDetailsModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: editMQTTSource } = useEditMQTTSource({
    onSuccess: () => {
      notification.success({
        message: t('notification-edit-source-details-success'),
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
    values: EditMQTTSourceFormValues
  ): FormikErrors<EditMQTTSourceFormValues> => {
    const errors: FormikErrors<EditMQTTSourceFormValues> = {};

    if (!values.host) {
      errors.host = t('validation-error-field-required');
    }
    if (!values.port) {
      errors.port = t('validation-error-field-required');
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<EditMQTTSourceFormValues>({
      initialValues: {
        host: source.host,
        port: source.port,
        useTls: source.useTls,
      },
      onSubmit: (val) => {
        if (val.host && val.port) {
          editMQTTSource({
            externalId: source.externalId,
            type: source.type,
            update: {
              host: {
                set: val.host,
              },
              port: {
                set: val.port,
              },
              useTls: {
                set: !!val.useTls,
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
      title={t('edit-source-details')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-host-name'),
          }}
          onChange={(e) => setFieldValue('host', e.target.value)}
          placeholder={t('form-host-name-placeholder')}
          status={errors.host ? 'critical' : undefined}
          statusText={errors.host}
          value={values.host}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-port'),
          }}
          onChange={(e) => setFieldValue('port', e.target.value)}
          placeholder={t('form-port-placeholder')}
          status={errors.port ? 'critical' : undefined}
          statusText={errors.port}
          value={values.port}
        />
        <Checkbox
          checked={!!values.useTls}
          onChange={(e) => setFieldValue('useTls', e.target.checked)}
        >
          {t('use-tls')}
        </Checkbox>
      </Flex>
    </Modal>
  );
};
