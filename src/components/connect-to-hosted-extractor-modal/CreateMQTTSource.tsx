import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Flex, InputExp } from '@cognite/cogs.js';
import { Select } from 'antd';
import { FormikErrors, FormikProps } from 'formik';

import { TranslationKeys, useTranslation } from 'common';
import {
  CreateMQTTSource as CreateMQTTSourceType,
  MQTTSourceType,
} from 'hooks/hostedExtractors';
import { FormField } from 'components/form-field/FormField';

type CreateMQTTSourceProps = {
  formik: FormikProps<CreateMQTTSourceFormValues>;
};

export type CreateMQTTSourceFormValues = Partial<CreateMQTTSourceType>;

export const MQTT_SOURCE_TYPE_OPTIONS: {
  label: string;
  value: MQTTSourceType;
}[] = [
  {
    label: 'Version 5',
    value: 'mqtt5',
  },
  { label: 'Version 3.1.1', value: 'mqtt3' },
];

export const validateCreateMQTTSourceForm = (
  values: CreateMQTTSourceFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
): FormikErrors<CreateMQTTSourceFormValues> => {
  const errors: FormikErrors<CreateMQTTSourceFormValues> = {};

  if (!values.externalId) {
    errors.externalId = t('validation-error-field-required');
  }
  if (!values.type) {
    errors.type = t('validation-error-field-required');
  }
  if (!values.username) {
    errors.username = t('validation-error-field-required');
  }
  if (!values.password) {
    errors.password = t('validation-error-field-required');
  }

  return errors;
};

export const CreateMQTTSource = ({
  formik,
}: CreateMQTTSourceProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  return (
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
      <FormField isRequired title={t('form-protocol-version')}>
        <Select
          onChange={(e) => setFieldValue('type', e)}
          options={MQTT_SOURCE_TYPE_OPTIONS}
          placeholder={t('form-protocol-version-placeholder')}
          value={values.type}
        />
      </FormField>
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
  );
};
