import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  RAW_TABLE_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import { BackBtn } from '../../components/buttons/BackBtn';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';

const StyledTextArea = styled.textarea`
  width: 80%;
  height: 10rem;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
interface DescriptionPageProps {}

interface ExternalIdFormInput {
  documentation: string;
}

export const INTEGRATION_DOCUMENTATION_HEADING: Readonly<string> =
  'Integration documentation';
export const DESCRIPTION_LABEL: Readonly<string> = 'Describe the integration';
const documentationSchema = yup.object().shape({
  documentation: yup.string(),
});
const DocumentationPage: FunctionComponent<DescriptionPageProps> = () => {
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<ExternalIdFormInput>({
    resolver: yupResolver(documentationSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(createLink(SCHEDULE_PAGE_PATH));
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
        <i className="description">
          Register any relevant information about your integration. This will
          help while troubleshooting if there is an issue.
        </i>
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
            className={`cogs-input ${errors.documentation ? 'has-error' : ''}`}
            aria-invalid={!!errors.documentation}
            aria-describedby="documentation-hint documentation-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default DocumentationPage;
