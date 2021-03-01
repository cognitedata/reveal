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
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';
import { EXTERNAL_ID_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from '../../hooks/useStoredRegisterIntegration';
import { HeadingLabel } from '../../components/inputs/HeadingLabel';

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
interface NamePageProps {}

interface NameFormInput {
  name: string;
}

export const INTEGRATION_NAME_HEADING: Readonly<string> = 'Integration name';
export const NAME_REQUIRED: Readonly<string> = 'Integration name is required';
const nameSchema = yup.object().shape({
  name: yup.string().required(NAME_REQUIRED),
});
const NamePage: FunctionComponent<NamePageProps> = () => {
  const history = useHistory();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { register, handleSubmit, errors } = useForm<NameFormInput>({
    resolver: yupResolver(nameSchema),
    defaultValues: {
      name: storedIntegration?.name,
    },
    reValidateMode: 'onSubmit',
  });
  const handleNext = (field: NameFormInput) => {
    setStoredIntegration({ ...storedIntegration, ...field });
    history.push(createLink(EXTERNAL_ID_PAGE_PATH));
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        Integration overview
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <HeadingLabel labelFor="integration-name">
            {INTEGRATION_NAME_HEADING}
          </HeadingLabel>
          <span id="name-hint" className="input-hint">
            Enter a name for your integration. It will be displayed in the
            integration overview.
          </span>
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => (
              <span id="name-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-name"
            name="name"
            type="text"
            ref={register}
            className={`cogs-input ${errors.name ? 'has-error' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby="name-hint name-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default NamePage;
