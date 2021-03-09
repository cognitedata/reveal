import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink, useUserContext } from '@cognite/cdf-utilities';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  NAME_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from '../../hooks/useStoredRegisterIntegration';
import { usePostIntegration } from '../../hooks/usePostIntegration';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';
import { translateServerErrorMessage } from '../../utils/error/TranslateErrorMessages';
import { BackBtn } from '../../components/buttons/BackBtn';
import { HeadingLabel } from '../../components/inputs/HeadingLabel';
import { TaskList, taskListItems } from './TaskList';

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
interface ExternalIdPageProps {}

interface ExternalIdFormInput {
  externalId: string;
}

export const INTEGRATION_EXTERNAL_ID_HEADING: Readonly<string> = 'External id';
export const EXTERNAL_ID_REQUIRED: Readonly<string> = 'External id is required';
const nameSchema = yup.object().shape({
  externalId: yup.string().required(EXTERNAL_ID_REQUIRED),
});

const ExternalIdPage: FunctionComponent<ExternalIdPageProps> = () => {
  const history = useHistory();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { mutate } = usePostIntegration();
  const user = useUserContext();
  const {
    register,
    handleSubmit,
    errors,
    setError,
  } = useForm<ExternalIdFormInput>({
    resolver: yupResolver(nameSchema),
    defaultValues: {
      externalId: storedIntegration?.externalId,
    },
    reValidateMode: 'onSubmit',
  });
  const handleNext = (field: ExternalIdFormInput) => {
    const creator = {
      name: '',
      email: user.username ?? '',
      role: 'Creator',
      sendNotification: true,
    };
    setStoredIntegration({
      ...storedIntegration,
      ...field,
      contacts: [creator],
    });
    if (storedIntegration?.name) {
      const integrationInfo = {
        ...storedIntegration,
        ...field,
        contacts: [creator],
      };
      mutate(
        { integrationInfo },
        {
          onSuccess: () => {
            history.push(createLink(CONTACTS_PAGE_PATH));
          },
          onError: (error, variables) => {
            const errorMessage = translateServerErrorMessage(
              error?.data,
              variables.integrationInfo
            );
            setError('externalId', {
              type: 'server',
              message: errorMessage,
              shouldFocus: true,
            });
          },
        }
      );
    } else {
      history.push(createLink(NAME_PAGE_PATH));
    }
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        Integration overview
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <BackBtn path={NAME_PAGE_PATH} />
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <HeadingLabel labelFor="integration-external-id">
            {INTEGRATION_EXTERNAL_ID_HEADING}
          </HeadingLabel>
          <span id="external-id-hint" className="input-hint">
            The external id is the id used to refer to this integration
            externally. It must be unique. Follow company conventions.
          </span>
          <ErrorMessage
            errors={errors}
            name="externalId"
            render={({ message }) => (
              <span id="external-id-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-external-id"
            name="externalId"
            type="text"
            ref={register}
            className={`cogs-input ${errors.externalId ? 'has-error' : ''}`}
            aria-invalid={!!errors.externalId}
            aria-describedby="external-id-hint external-id-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
        <TaskList list={taskListItems} />
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ExternalIdPage;
