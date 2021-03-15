import React, { FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { ButtonPlaced } from 'styles/StyledButton';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { GridH2Wrapper } from 'styles/StyledPage';
import { CreateFormWrapper } from 'styles/StyledForm';
import { RAW_TABLE_PAGE_PATH } from 'routing/CreateRouteConfig';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from 'routing/RoutingConfig';
import { REGISTER } from 'utils/constants';
import { useDetailsUpdate } from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { createUpdateSpec } from 'utils/contactsUtils';
import {
  MetaData,
  RegisterMetaData,
} from 'components/inputs/metadata/RegisterMetaData';

const DividerLine = styled.hr`
  height: 0.125rem;
  width: 100%;
  background: ${Colors['greyscale-grey3'].hex()};
  margin: 1rem 0;
  border: none;
`;
const WithBottomBorder = styled.div`
  padding-bottom: 2rem;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey3'].hex()};
`;
const StyledTextArea = styled.textarea`
  width: 80%;
  height: 10rem;
  padding-bottom: 2rem;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey3'].hex()};
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  :before {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: black;
  }
`;
interface DescriptionPageProps {}

interface DocumentationFormInput {
  description: string;
  metadata: MetaData[];
}

export const INTEGRATION_DOCUMENTATION_HEADING: Readonly<string> =
  'Integration documentation';
export const DESCRIPTION_LABEL: Readonly<string> = 'Describe the integration';
const documentationSchema = yup.object().shape({
  description: yup.string(),
});
const DocumentationPage: FunctionComponent<DescriptionPageProps> = () => {
  const history = useHistory();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();

  const methods = useForm<DocumentationFormInput>({
    resolver: yupResolver(documentationSchema),
    defaultValues: {
      description: storedIntegration?.description,
    },
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, setError } = methods;
  const handleNext = (fields: DocumentationFormInput) => {
    setStoredIntegration((prev) => ({
      ...prev,
      description: fields.description,
    }));
    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        id: storedIntegration.id,
        fieldName: 'description',
        fieldValue: fields.description,
      });
      mutate(
        {
          project,
          items,
          id: storedIntegration.id,
        },
        {
          onSuccess: () => {
            history.push(createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH));
          },
          onError: (serverError) => {
            setError('description', {
              type: 'server',
              message: serverError.data.message,
              shouldFocus: true,
            });
          },
        }
      );
    } else {
      setError('description', {
        type: 'No id',
        message: 'No id. Select an integration',
        shouldFocus: true,
      });
    }
  };

  return (
    <RegisterIntegrationLayout backPath={RAW_TABLE_PAGE_PATH}>
      <GridH2Wrapper>{INTEGRATION_DOCUMENTATION_HEADING}</GridH2Wrapper>
      <WithBottomBorder as="i" className="description">
        Register any relevant information about your integration. This will help
        while troubleshooting if there is an issue.
      </WithBottomBorder>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="integration-description" className="input-label">
            {DESCRIPTION_LABEL}
          </label>
          <span id="description-hint" className="input-hint" />
          <ErrorMessage
            errors={errors}
            name="description"
            render={({ message }) => (
              <span id="description-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledTextArea
            id="integration-description"
            name="description"
            cols={30}
            rows={10}
            ref={register}
            className={`cogs-input ${errors.description ? 'has-error' : ''}`}
            aria-invalid={!!errors.description}
            aria-describedby="description-hint description-error"
          />
          <DividerLine />
          <RegisterMetaData />
          <DividerLine />
          <ButtonPlaced type="primary" htmlType="submit">
            {REGISTER}
          </ButtonPlaced>
        </CreateFormWrapper>
      </FormProvider>
    </RegisterIntegrationLayout>
  );
};
export default DocumentationPage;
