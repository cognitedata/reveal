import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Select, notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { createLink } from '@cognite/cdf-utilities';
import { Checkbox, Flex, InputExp, Modal, ModalProps } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  BaseMQTTSource,
  MQTTSourceType,
  useCreateMQTTSource,
} from '../../hooks/hostedExtractors';
import { FormFieldWrapper } from '../form-fields';

export const MQTT_SOURCE_TYPE_LABEL: Record<MQTTSourceType, string> = {
  mqtt3: 'Version 3.1.1',
  mqtt5: 'Version 5',
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
  useTls?: boolean;
};

type CreateSourceModalProps = {
  onCancel: () => void;
  visible: ModalProps['visible'];
};

export const CreateSourceModal = ({
  onCancel,
  visible,
}: CreateSourceModalProps): JSX.Element => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { mutate: createMQTTSource } = useCreateMQTTSource({
    onSuccess: (_, variables) => {
      notification.success({
        message: t('notification-success-source-create'),
        key: 'create-source',
      });
      onCancel();
      navigate(
        createLink(
          `/extpipes/hosted-extraction-pipeline/${variables.externalId}`
        )
      );
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

    if (!values.port) {
      errors.port = t('validation-error-field-required');
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateMQTTSourceFormValues>({
      initialValues: {
        type: 'mqtt5',
        port: '1883',
      },
      onSubmit: (val) => {
        if (val.externalId && val.type && val.host) {
          createMQTTSource({
            externalId: val.externalId,
            type: val.type,
            host: val.host,
            ...(values.username && { username: values.username }),
            ...(values.password && { password: values.password }),
            port: values.port,
            useTls: values.useTls,
          });
        }
      },
      validate: handleValidate,
      validateOnBlur: false,
      validateOnChange: false,
    });

  const onClickUseTLS = useCallback(
    (e: any) => {
      setFieldValue('useTls', e.target.checked);
      if (e.target.checked) {
        if (!values.port || values.port === '1883') {
          setFieldValue('port', '8883');
        }
      } else {
        if (!values.port || values.port === '8883') {
          setFieldValue('port', '1883');
        }
      }
    },
    [setFieldValue, values.port]
  );
  return (
    <Modal
      onCancel={onCancel}
      okText={t('create')}
      onOk={handleSubmit}
      title={t('create-source')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-source-external-id'),
          }}
          onChange={(e) => setFieldValue('externalId', e.target.value)}
          placeholder={t('form-source-external-id-placeholder')}
          status={errors.externalId ? 'critical' : undefined}
          statusText={errors.externalId}
          value={values.externalId}
        />
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
        <Flex gap={16}>
          <div style={{ flex: '1 1 0' }}>
            <FormFieldWrapper isRequired title={t('form-protocol-version')}>
              <Select
                onChange={(e) => setFieldValue('type', e)}
                options={MQTT_SOURCE_TYPE_OPTIONS}
                placeholder={t('form-protocol-version-placeholder')}
                value={values.type}
              />
            </FormFieldWrapper>
          </div>
          <div style={{ flex: '1 1 0' }}>
            <InputExp
              clearable
              fullWidth
              required
              label={{
                required: false,
                info: undefined,
                text: t('form-port'),
              }}
              onChange={(e) => setFieldValue('port', e.target.value)}
              placeholder={t('form-port-placeholder')}
              status={errors.port ? 'critical' : undefined}
              statusText={errors.port}
              value={values.port}
            />
          </div>
        </Flex>
        <Checkbox onChange={onClickUseTLS} checked={values.useTls}>
          {t('use-tls')}
        </Checkbox>
        <InputExp
          clearable
          fullWidth
          label={{
            required: false,
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
            required: false,
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
