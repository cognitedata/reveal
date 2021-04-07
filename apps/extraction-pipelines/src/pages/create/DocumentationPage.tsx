import React, { FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { FullTextArea } from 'components/inputs/FullTextArea';

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
export const StyledTextArea = styled.textarea`
  height: 10rem;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
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
export const DESCRIPTION_HINT: Readonly<string> =
  'For users of data a good description of data content and other relevant metrics connected to data will give value for them to know the data better. Please enter a description.';
export const DESCRIPTION_LABEL: Readonly<string> = 'Description (optional)';
export const descriptionRule = {
  description: yup.string(),
};
const documentationSchema = yup.object().shape(descriptionRule);
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
  const { control, handleSubmit, errors, setError } = methods;
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
          <FullTextArea
            name="description"
            control={control}
            defaultValue=""
            labelText={DESCRIPTION_LABEL}
            hintText={DESCRIPTION_HINT}
            inputId="integration-description"
            errors={errors}
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
