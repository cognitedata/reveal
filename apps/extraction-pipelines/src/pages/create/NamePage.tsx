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
  CREATE_INTEGRATION_PAGE_PATH,
  EXTERNAL_ID_PAGE_PATH,
} from '../../routing/RoutingConfig';

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
  const { register, handleSubmit, errors } = useForm<NameFormInput>({
    resolver: yupResolver(nameSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(createLink(EXTERNAL_ID_PAGE_PATH));
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(CREATE_INTEGRATION_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_NAME_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="integration-name" className="input-label">
            Name
          </label>
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
