import { useTranslation } from '@transformations/common';
import FormFieldInput from '@transformations/components/form-field-input';
import { useTestCredentials } from '@transformations/hooks/sessions';
import { FormikProps } from 'formik';

import { getProject } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';

import {
  CredentialsFormValues,
  StyledCredentialsFormSectionContainer,
} from '.';
import TestCredentialsButton from './TestCredentialsButton';

type StandardCredentialsFormProps = {
  formik: FormikProps<CredentialsFormValues>;
};

const StandardCredentialsForm = ({
  formik,
}: StandardCredentialsFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const testCredentials = useTestCredentials();

  const handleTestCredentials = () => {
    if (values.readClientId && values.readClientSecret) {
      testCredentials({
        credentials: {
          clientId: values.readClientId,
          clientSecret: values.readClientSecret,
        },
        project: getProject(),
      }).then((res) => {
        setFieldValue('readSessionValidation', res);
      });
    }
  };

  return (
    <Flex direction="column" gap={8}>
      <Flex alignItems="center" justifyContent="space-between">
        <Body level={2} strong>
          {t('read-and-write-credentials')}
        </Body>
        <TestCredentialsButton
          isDisabled={!values.readClientId || !values.readClientSecret}
          onTest={handleTestCredentials}
          validation={values.readSessionValidation}
          isLoading={values.readSessionValidation}
        />
      </Flex>
      <StyledCredentialsFormSectionContainer>
        <FormFieldInput
          error={errors.readClientId}
          isRequired
          onChange={(value) => {
            setFieldValue('readClientId', value);
            setFieldValue('readSessionValidation', undefined);
          }}
          placeholder={t('enter-client-id')}
          title={t('client-id')}
          value={values.readClientId}
        />
        <FormFieldInput
          error={errors.readClientSecret}
          isRequired
          onChange={(value) => {
            setFieldValue('readClientSecret', value);
            setFieldValue('readSessionValidation', undefined);
          }}
          placeholder={t('enter-client-secret')}
          title={t('client-secret')}
          value={values.readClientSecret}
          type="password"
        />
      </StyledCredentialsFormSectionContainer>
    </Flex>
  );
};

export default StandardCredentialsForm;
