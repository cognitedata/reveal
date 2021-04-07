import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createLink } from '@cognite/cdf-utilities';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ButtonPlaced } from 'styles/StyledButton';
import { NEXT } from 'utils/constants';
import { CreateFormWrapper } from 'styles/StyledForm';
import { EXTERNAL_ID_PAGE_PATH } from 'routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { TaskList, taskListItems } from 'pages/create/TaskList';
import { FullInput } from 'components/inputs/FullInput';
import { nameSchema } from 'utils/validation/integrationSchemas';

interface NamePageProps {}

interface NameFormInput {
  name: string;
}
export const NAME_HINT =
  'Enter a name for your integration to be able to view and monitor this.';

export const INTEGRATION_NAME_HEADING: Readonly<string> = 'Integration name';
const NamePage: FunctionComponent<NamePageProps> = () => {
  const history = useHistory();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { control, handleSubmit, errors } = useForm<NameFormInput>({
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
      <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
        <FullInput
          name="name"
          inputId="integration-name"
          defaultValue=""
          control={control}
          errors={errors}
          labelText={INTEGRATION_NAME_HEADING}
          hintText={NAME_HINT}
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
