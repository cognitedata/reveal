import { useTranslation } from '@transformations/common';
import FormFieldInput from '@transformations/components/form-field-input';
import { useTestCredentials } from '@transformations/hooks/sessions';
import { FormikProps } from 'formik';

import { Body, Flex } from '@cognite/cogs.js';

import {
  CredentialsFormValues,
  StyledCredentialsFormSectionContainer,
} from '.';
import TestCredentialsButton from './TestCredentialsButton';

type AdvancedCredentialsFormProps = {
  formik: FormikProps<CredentialsFormValues>;
};

const AdvancedCredentialsForm = ({
  formik,
}: AdvancedCredentialsFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const testCredentials = useTestCredentials();

  const handleTestReadCredentials = () => {
    if (values.readClientId && values.readClientSecret) {
      testCredentials({
        credentials: {
          clientId: values.readClientId,
          clientSecret: values.readClientSecret,
        },
        project: values.readProject,
      }).then((res) => {
        setFieldValue('readSessionValidation', res);
      });
    }
  };

  const handleTestWriteCredentials = () => {
    if (values.writeClientId && values.writeClientSecret) {
      testCredentials({
        credentials: {
          clientId: values.writeClientId,
          clientSecret: values.writeClientSecret,
        },
        project: values.writeProject,
      }).then((res) => {
        setFieldValue('writeSessionValidation', res);
      });
    }
  };

  return (
    <Flex direction="column" gap={16}>
      <Flex direction="column" gap={8}>
        <Flex alignItems="center" justifyContent="space-between">
          <Body level={2} strong>
            {t('read-credentials')}
          </Body>
          <TestCredentialsButton
            isDisabled={!values.readClientId || !values.readClientSecret}
            onTest={handleTestReadCredentials}
            validation={values.readSessionValidation}
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
          <FormFieldInput
            error={errors.readProject}
            isRequired
            onChange={(value) => {
              setFieldValue('readProject', value);
              setFieldValue('readSessionValidation', undefined);
            }}
            placeholder="Enter project name" // FIXME
            title="Project" // FIXME
            value={values.readProject}
          />
        </StyledCredentialsFormSectionContainer>
      </Flex>
      <Flex direction="column" gap={8}>
        <Flex alignItems="center" justifyContent="space-between">
          <Body level={2} strong>
            {t('write-credentials')}
          </Body>
          <TestCredentialsButton
            isDisabled={!values.writeClientId || !values.writeClientSecret}
            onTest={handleTestWriteCredentials}
            validation={values.writeSessionValidation}
          />
        </Flex>
        <StyledCredentialsFormSectionContainer>
          <FormFieldInput
            error={errors.writeClientId}
            isRequired
            onChange={(value) => {
              setFieldValue('writeClientId', value);
              setFieldValue('writeSessionValidation', undefined);
            }}
            placeholder={t('enter-client-id')}
            title={t('client-id')}
            value={values.writeClientId}
          />
          <FormFieldInput
            error={errors.writeClientSecret}
            isRequired
            onChange={(value) => {
              setFieldValue('writeClientSecret', value);
              setFieldValue('writeSessionValidation', undefined);
            }}
            placeholder={t('enter-client-secret')}
            title={t('client-secret')}
            value={values.writeClientSecret}
            type="password"
          />
          <FormFieldInput
            error={errors.writeProject}
            isRequired
            onChange={(value) => {
              setFieldValue('writeProject', value);
              setFieldValue('writeSessionValidation', undefined);
            }}
            placeholder={t('enter-project-name')}
            title={t('project')}
            value={values.writeProject}
          />
        </StyledCredentialsFormSectionContainer>
      </Flex>
    </Flex>
  );
};

export default AdvancedCredentialsForm;
