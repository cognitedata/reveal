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
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { REGISTER } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import { RAW_TABLE_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { BackBtn } from '../../components/buttons/BackBtn';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';
import {
  MetaData,
  RegisterMetaData,
} from '../../components/inputs/metadata/RegisterMetaData';

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
  documentation: string;
  metadata: MetaData[];
}

export const INTEGRATION_DOCUMENTATION_HEADING: Readonly<string> =
  'Integration documentation';
export const DESCRIPTION_LABEL: Readonly<string> = 'Describe the integration';
const documentationSchema = yup.object().shape({
  documentation: yup.string(),
});
const DocumentationPage: FunctionComponent<DescriptionPageProps> = () => {
  const history = useHistory();
  const methods = useForm<DocumentationFormInput>({
    resolver: yupResolver(documentationSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors } = methods;
  const handleNext = (_: DocumentationFormInput) => {
    history.push(createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH));
  };

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        Integration overview
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <BackBtn path={RAW_TABLE_PAGE_PATH} />
        <GridH2Wrapper>{INTEGRATION_DOCUMENTATION_HEADING}</GridH2Wrapper>
        <WithBottomBorder as="i" className="description">
          Register any relevant information about your integration. This will
          help while troubleshooting if there is an issue.
        </WithBottomBorder>
        <FormProvider {...methods}>
          <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
            <label htmlFor="integration-documentation" className="input-label">
              {DESCRIPTION_LABEL}
            </label>
            <span id="documentation-hint" className="input-hint" />
            <ErrorMessage
              errors={errors}
              name="documentation"
              render={({ message }) => (
                <span id="documentation-error" className="error-message">
                  {message}
                </span>
              )}
            />
            <StyledTextArea
              id="integration-documentation"
              name="documentation"
              cols={30}
              rows={10}
              ref={register}
              className={`cogs-input ${
                errors.documentation ? 'has-error' : ''
              }`}
              aria-invalid={!!errors.documentation}
              aria-describedby="documentation-hint documentation-error"
            />
            <DividerLine />
            <RegisterMetaData />
            <DividerLine />
            <ButtonPlaced type="primary" htmlType="submit">
              {REGISTER}
            </ButtonPlaced>
          </CreateFormWrapper>
        </FormProvider>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default DocumentationPage;
