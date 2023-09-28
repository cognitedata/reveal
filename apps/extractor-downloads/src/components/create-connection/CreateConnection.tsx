import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { notification, Select } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { createLink } from '@cognite/cdf-utilities';
import {
  Body,
  Divider,
  Flex,
  InputExp,
  Row,
  Heading,
  Checkbox,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  CreateMQTTSource,
  MQTTSourceType,
  useCreateMQTTSource,
} from '../../hooks/hostedExtractors';
import FormFieldWrapper from '../form-field-wrapper/FormFieldWrapper';
import { BottomBar, TopBar } from '../ToolBars';

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

type CreateMQTTSourceFormValues = Partial<CreateMQTTSource>;

export const CreateConnection = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { mutate: createMQTTSource } = useCreateMQTTSource({
    onSuccess: (_, variables) => {
      notification.success({
        message: t('create-connection-success'),
        key: 'create-connection-success',
      });
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
    if (!values.port) {
      errors.host = t('validation-error-field-required');
    }
    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateMQTTSourceFormValues>({
      initialValues: {
        type: MQTT_SOURCE_TYPE_OPTIONS[0].value,
        port: '1883',
      },
      // eslint-disable-next-line @typescript-eslint/no-shadow
      onSubmit: (values) => {
        if (values.externalId && values.type && values.host) {
          createMQTTSource({
            externalId: values.externalId,
            type: values.type,
            host: values.host,
            port: values.port,
            ...(values.username && { username: values.username }),
            ...(values.password && { password: values.password }),
            useTls: values.useTls,
          });
        }
      },
      validate: handleValidate,
      validateOnBlur: false,
      validateOnChange: false,
    });

  const onTypeChange = useCallback(
    (val: string) => {
      setFieldValue('type', val);
    },
    [setFieldValue]
  );

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
    <Flex direction="column" style={{ height: '100%', minWidth: 1200 }}>
      <TopBar title={t('back')} onClick={() => navigate(-1)} />
      <Flex
        direction="column"
        style={{ padding: '40px 80px 16px 80px', flex: '1 1 0' }}
        alignItems="center"
        gap={32}
      >
        <Flex direction="column">
          <Flex justifyContent="center">
            <Heading level={3}>{t('connect-to-mqtt-broker')}</Heading>
          </Flex>
          <Flex justifyContent="center">
            <Body size="medium" muted>
              {t('create-connection-broker-cdf')}
            </Body>
          </Flex>
        </Flex>
        <Flex direction="column" style={{ width: 600 }} gap={24}>
          <Heading level={5}>{t('connection-information')}</Heading>
          <InputExp
            clearable
            fullWidth
            label={{
              required: true,
              info: undefined,
              text: t('create-connection-form-source-external-id'),
            }}
            style={{ width: '100%' }}
            width="100%"
            onChange={(e) => setFieldValue('externalId', e.target.value)}
            placeholder={t(
              'create-connection-form-source-external-id-placeholder'
            )}
            status={errors.externalId ? 'critical' : undefined}
            statusText={errors.externalId}
            value={values.externalId}
          />
          <Divider />
          <Heading level={5}>{t('mqtt-broker-info')}</Heading>
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
          <Row gap={16} cols={2}>
            <FormFieldWrapper
              isRequired
              title={t('create-connection-form-protocol-version')}
            >
              <Select
                onChange={onTypeChange}
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
                text: t('create-connection-form-port'),
              }}
              onChange={(e) => setFieldValue('port', e.target.value)}
              placeholder={t('create-connection-form-port-placeholder')}
              status={errors.port ? 'critical' : undefined}
              statusText={errors.port}
              type="number"
              value={values.port}
            />
          </Row>
          <Checkbox onChange={onClickUseTLS} checked={values.useTls}>
            {t('use-tls')}
          </Checkbox>
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
      </Flex>
      <BottomBar title={t('field-is-mandatory')} onSubmit={handleSubmit} />
    </Flex>
  );
};
