import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { createLink } from '@cognite/cdf-utilities';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper } from 'styles/StyledForm';
import { EXTERNAL_ID_PAGE_PATH } from 'routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { TaskList, taskListItems } from 'pages/create/TaskList';
import { InputController } from 'components/inputs/InputController';

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
  const { handleSubmit, errors, control } = useForm<NameFormInput>({
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
    <RegisterIntegrationLayout>
      <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
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
        <InputController
          name="name"
          control={control}
          inputId="integration-name"
          defaultValue={storedIntegration?.name ?? ''}
          aria-invalid={!!errors.name}
          aria-describedby="name-hint name-error"
        />
        <ButtonPlaced type="primary" htmlType="submit">
          {NEXT}
        </ButtonPlaced>
      </CreateFormWrapper>
      <TaskList list={taskListItems} />
    </RegisterIntegrationLayout>
  );
};
export default NamePage;
