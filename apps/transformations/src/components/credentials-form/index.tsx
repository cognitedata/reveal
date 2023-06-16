import styled from 'styled-components';

import { TranslationKeys, useTranslation } from '@transformations/common';
import FormFieldRadioGroup from '@transformations/components/form-field-radio-group';
import { FormikErrors, FormikProps } from 'formik';

import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Body, Flex, Colors } from '@cognite/cogs.js';

import AdvancedCredentialsForm from './AdvancedCredentialsForm';
import StandardCredentialsForm from './StandardCredentialsForm';

type CredentialsFormProps = {
  formik: FormikProps<CredentialsFormValues>;
};

type AuthenticationMethod = 'standard' | 'advanced';

export type CredentialsFormValues = {
  method: AuthenticationMethod;
  readClientId?: string;
  readClientSecret?: string;
  readProject?: string;
  readSessionValidation?: boolean;
  writeClientId?: string;
  writeClientSecret?: string;
  writeProject?: string;
  writeSessionValidation?: boolean;
};

export const validateCredentialsForm = (
  values: CredentialsFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
) => {
  const errors: FormikErrors<CredentialsFormValues> = {};

  if (!values.method) {
    errors.method = t('validation-error-field-required');
  } else if (values.method === 'standard') {
    if (!values.readClientId) {
      errors.readClientId = t('validation-error-field-required');
    }
    if (!values.readClientSecret) {
      errors.readClientSecret = t('validation-error-field-required');
    }
  } else if (values.method === 'advanced') {
    if (!values.readClientId) {
      errors.readClientId = t('validation-error-field-required');
    }
    if (!values.readClientSecret) {
      errors.readClientSecret = t('validation-error-field-required');
    }
    if (!values.readProject) {
      errors.readProject = t('validation-error-field-required');
    }
    if (!values.writeClientId) {
      errors.writeClientId = t('validation-error-field-required');
    }
    if (!values.writeClientSecret) {
      errors.writeClientSecret = t('validation-error-field-required');
    }
    if (!values.writeProject) {
      errors.writeProject = t('validation-error-field-required');
    }
  }

  return errors;
};

const CredentialsForm = ({ formik }: CredentialsFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { resetForm, setFieldValue, values } = formik;

  return (
    <Flex direction="column" gap={16}>
      <FormFieldRadioGroup
        isRequired
        onChange={(value) => {
          resetForm();
          setFieldValue('method', value);
        }}
        options={[
          {
            details: `(${t('default')})`,
            label: t('standard'),
            value: 'standard',
          },
          {
            label: t('advanced'),
            value: 'advanced',
          },
        ]}
        title={t('authentication-method')}
        value={values.method}
      />
      <Body level={2}>
        <p>{t('oidc-credentials-description')}</p>
      </Body>
      {values.method === 'standard' ? (
        <StandardCredentialsForm formik={formik} />
      ) : (
        <AdvancedCredentialsForm formik={formik} />
      )}
    </Flex>
  );
};

export const StyledCredentialsFormSectionContainer = styled.div`
  background-color: ${Colors['surface--strong']};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
`;

export default CredentialsForm;
