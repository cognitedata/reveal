import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { createLink, useUserContext } from '@cognite/cdf-utilities';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper } from 'styles/StyledForm';
import { CONTACTS_PAGE_PATH, NAME_PAGE_PATH } from 'routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { usePostIntegration } from 'hooks/usePostIntegration';
import { translateServerErrorMessage } from 'utils/error/TranslateErrorMessages';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { TaskList, taskListItems } from 'pages/create/TaskList';
import { InputController } from 'components/inputs/InputController';

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
    control,
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
    setStoredIntegration((prev) => {
      return {
        ...prev,
        ...field,
        contacts: [creator],
      };
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
          onSuccess: (data) => {
            setStoredIntegration((prev) => {
              return { ...prev, ...data };
            });
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
    <RegisterIntegrationLayout backPath={NAME_PAGE_PATH}>
      <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
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
        <InputController
          name="externalId"
          control={control}
          inputId="integration-external-id"
          defaultValue={storedIntegration?.externalId ?? ''}
          aria-invalid={!!errors.externalId}
          aria-describedby="external-id-hint external-id-error"
        />
        <ButtonPlaced type="primary" htmlType="submit">
          {NEXT}
        </ButtonPlaced>
      </CreateFormWrapper>
      <TaskList list={taskListItems} />
    </RegisterIntegrationLayout>
  );
};
export default ExternalIdPage;
