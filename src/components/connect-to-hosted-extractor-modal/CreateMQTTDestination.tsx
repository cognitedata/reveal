import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Flex, InputExp } from '@cognite/cogs.js';
import { Select } from 'antd';
import { FormikErrors, FormikProps } from 'formik';

import { TranslationKeys, useTranslation } from 'common';
import {
  CreateMQTTDestination as CreateMQTTDestinationType,
  MQTTDestinationType,
} from 'hooks/hostedExtractors';
import { FormField } from 'components/form-field/FormField';

type CreateMQTTDestinationProps = {
  formik: FormikProps<CreateMQTTDestinationFormValues>;
};

export type CreateMQTTDestinationFormValues = Partial<
  Omit<CreateMQTTDestinationType, 'credentials'>
> & {
  clientId?: string;
  clientSecret?: string;
};

export const MQTT_DESTINATION_TYPE_OPTIONS: {
  label: string;
  value: MQTTDestinationType;
}[] = [
  {
    label: 'Datapoints',
    value: 'datapoints',
  },
];

export const validateCreateMQTTDestinationForm = (
  values: CreateMQTTDestinationFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
): FormikErrors<CreateMQTTDestinationFormValues> => {
  const errors: FormikErrors<CreateMQTTDestinationFormValues> = {};

  if (!values.externalId) {
    errors.externalId = t('validation-error-field-required');
  }
  if (!values.type) {
    errors.type = t('validation-error-field-required');
  }
  if (!values.clientId) {
    errors.clientId = t('validation-error-field-required');
  }
  if (!values.clientSecret) {
    errors.clientSecret = t('validation-error-field-required');
  }

  return errors;
};

export const CreateMQTTDestination = ({
  formik,
}: CreateMQTTDestinationProps): JSX.Element => {
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
          text: t('form-destination-external-id'),
        }}
        onChange={(e) => setFieldValue('externalId', e.target.value)}
        placeholder={t('form-destination-external-id-placeholder')}
        status={errors.externalId ? 'critical' : undefined}
        statusText={errors.externalId}
        value={values.externalId}
      />
      <FormField isRequired title={t('form-destination-type')}>
        <Select
          onChange={(e) => setFieldValue('type', e)}
          options={MQTT_DESTINATION_TYPE_OPTIONS}
          placeholder={t('form-destination-type-placeholder')}
          value={values.type}
        />
      </FormField>
      <InputExp
        clearable
        fullWidth
        label={{
          required: true,
          info: undefined,
          text: t('form-client-id'),
        }}
        onChange={(e) => setFieldValue('clientId', e.target.value)}
        placeholder={t('form-client-id-placeholder')}
        status={errors.clientId ? 'critical' : undefined}
        statusText={errors.clientId}
        value={values.clientId}
      />
      <InputExp
        clearable
        fullWidth
        label={{
          required: true,
          info: undefined,
          text: t('form-client-secret'),
        }}
        onChange={(e) => setFieldValue('clientSecret', e.target.value)}
        placeholder={t('form-client-secret-placeholder')}
        status={errors.clientSecret ? 'critical' : undefined}
        statusText={errors.clientSecret}
        value={values.clientSecret}
      />
    </Flex>
  );
};
