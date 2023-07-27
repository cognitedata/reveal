import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Select, notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { createLink } from '@cognite/cdf-utilities';
import { Flex, InputExp, Modal, ModalProps } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  BaseMQTTSource,
  MQTTSourceType,
  useCreateMQTTSource,
} from '../../hooks/hostedExtractors';
import FormFieldWrapper from '../form-field-wrapper/FormFieldWrapper';

export const MQTT_SOURCE_TYPE_LABEL: Record<MQTTSourceType, string> = {
  mqtt3: 'Version 5',
  mqtt5: 'Version 3.1.1',
};

export const MQTT_SOURCE_TYPE_OPTIONS: {
  label: string;
  value: MQTTSourceType;
}[] = [
  {
    label: MQTT_SOURCE_TYPE_LABEL['mqtt5'],
    value: 'mqtt5',
  },
  { label: MQTT_SOURCE_TYPE_LABEL['mqtt3'], value: 'mqtt3' },
];

type CreateMQTTSourceFormValues = Partial<BaseMQTTSource> & {
  password?: string;
};

type CreateConnectionModalProps = {
  onCancel: () => void;
  visible: ModalProps['visible'];
};

export const CreateConnectionModal = ({
  onCancel,
  visible,
}: CreateConnectionModalProps): JSX.Element => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { mutate: createMQTTSource } = useCreateMQTTSource({
    onSuccess: (_, variables) => {
      notification.success({
        message: t('create-connection-success'),
        key: 'create-connection-success',
      });
      onCancel();
      navigate(
        createLink(
          `/extpipes/hosted-extraction-pipeline/${variables.externalId}`
        )
      );
    },
    onError: (error: any) => {
      notification.error({
        message: error.toString(),
        description: error.message,
        key: 'create-connection-error',
      });
    },
  });

  const handleValidate = (
    values: CreateMQTTSourceFormValues
  ): FormikErrors<CreateMQTTSourceFormValues> => {
    const errors: FormikErrors<CreateMQTTSourceFormValues> = {};

    if (!values.externalId) {
      errors.externalId = t('validation-error-field-required');
    }
    if (!values.type) {
      errors.type = t('validation-error-field-required');
    }
    if (!values.host) {
      errors.host = t('validation-error-field-required');
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateMQTTSourceFormValues>({
      initialValues: {
        type: MQTT_SOURCE_TYPE_OPTIONS[0].value,
      },
      // eslint-disable-next-line @typescript-eslint/no-shadow
      onSubmit: (values) => {
        if (
          values.externalId &&
          values.type &&
          values.host &&
          values.username &&
          values.password
        ) {
          createMQTTSource({
            externalId: values.externalId,
            type: values.type,
            username: values.username,
            password: values.password,
            host: values.host,
            port: values.port,
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
      okText={t('create')}
      onOk={handleSubmit}
      title={t('create-connection')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('create-connection-form-source-external-id'),
          }}
          onChange={(e) => setFieldValue('externalId', e.target.value)}
          placeholder={t(
            'create-connection-form-source-external-id-placeholder'
          )}
          status={errors.externalId ? 'critical' : undefined}
          statusText={errors.externalId}
          value={values.externalId}
        />
        <FormFieldWrapper
          isRequired
          title={t('create-connection-form-protocol-version')}
        >
          <Select
            onChange={(e) => setFieldValue('type', e)}
            options={MQTT_SOURCE_TYPE_OPTIONS}
            placeholder={t(
              'create-connection-form-protocol-version-placeholder'
            )}
            value={values.type}
          />
        </FormFieldWrapper>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('create-connection-form-host-name'),
          }}
          onChange={(e) => setFieldValue('host', e.target.value)}
          placeholder={t('create-connection-form-host-name-placeholder')}
          status={errors.host ? 'critical' : undefined}
          statusText={errors.host}
          value={values.host}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: false,
            info: undefined,
            text: t('create-connection-form-port'),
          }}
          onChange={(e) => setFieldValue('port', e.target.value)}
          placeholder={t('create-connection-form-port-placeholder')}
          status={errors.port ? 'critical' : undefined}
          statusText={errors.port}
          type="number"
          value={values.port}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: false,
            info: undefined,
            text: t('create-connection-form-username'),
          }}
          onChange={(e) => setFieldValue('username', e.target.value)}
          placeholder={t('create-connection-form-username-placeholder')}
          value={values.username}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: false,
            info: undefined,
            text: t('create-connection-form-password'),
          }}
          onChange={(e) => setFieldValue('password', e.target.value)}
          placeholder={t('create-connection-form-password-placeholder')}
          type="password"
          value={values.password}
        />
      </Flex>
    </Modal>
  );
};
