import React, { FunctionComponent, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { createLink } from '@cognite/cdf-utilities';
import { ButtonPlaced } from 'styles/StyledButton';
import { NotificationConfig } from 'components/inputs/NotificationConfig';
import * as yup from 'yup';
import {
  MIN_IN_HOURS,
  skipNotificationRule,
} from 'utils/validation/notificationValidation';
import { GridH2Wrapper } from 'styles/StyledPage';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { ERROR_NO_ID, NEXT } from 'utils/constants';
import { CreateFormWrapper } from 'styles/StyledForm';
import { contactsRule } from 'utils/validation/contactsSchema';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import {
  EXTERNAL_ID_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { CreateContacts } from 'components/integration/create/CreateContacts';

interface ContactsPageProps {}

export interface ContactsFormInput {
  contacts: {
    name: string;
    email: string;
    role: string;
    sendNotification: boolean;
  }[];
  skipNotificationInHours: number;
  hasConfig: boolean;
}

const pageSchema = yup
  .object()
  .shape({ ...contactsRule, ...skipNotificationRule });
const ContactsPage: FunctionComponent<ContactsPageProps> = () => {
  const history = useHistory();
  const { project } = useAppEnv();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { mutate } = useDetailsUpdate();
  const methods = useForm<ContactsFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      contacts: storedIntegration?.contacts ?? [],
      skipNotificationInHours: storedIntegration?.skipNotificationsInMinutes
        ? storedIntegration?.skipNotificationsInMinutes / MIN_IN_HOURS
        : undefined,
      hasConfig: storedIntegration?.skipNotificationsInMinutes
        ? storedIntegration?.skipNotificationsInMinutes > 0
        : false,
    },
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, setError } = methods;
  useEffect(() => {
    register('skipNotificationInHours');
    register('hasConfig');
  }, [register]);
  const handleNext = async (field: ContactsFormInput) => {
    setStoredIntegration({
      ...storedIntegration,
      contacts: field.contacts,
      skipNotificationsInMinutes: field.skipNotificationInHours * MIN_IN_HOURS,
    });
    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldName: 'contacts',
        fieldValue: field.contacts ?? [],
      });
      mutate(items, {
        onSuccess: () => {
          history.push(createLink(SCHEDULE_PAGE_PATH));
        },
        onError: (serverError) => {
          setError('contacts', {
            type: 'server',
            message: serverError.data.message,
            shouldFocus: true,
          });
        },
      });
    } else {
      setError('contacts', {
        type: 'No id',
        message: ERROR_NO_ID,
        shouldFocus: true,
      });
    }
  };

  return (
    <RegisterIntegrationLayout backPath={EXTERNAL_ID_PAGE_PATH}>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
          <CreateContacts
            renderLabel={(labelText) => (
              <GridH2Wrapper>{labelText}</GridH2Wrapper>
            )}
          />
          <NotificationConfig
            renderLabel={(labelText) => (
              <GridH2Wrapper>{labelText}</GridH2Wrapper>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="contacts"
            render={({ message }) => (
              <span id="contact-error" className="error-message server-error">
                {message}
              </span>
            )}
          />
          <ButtonPlaced type="primary" htmlType="submit">
            {NEXT}
          </ButtonPlaced>
        </CreateFormWrapper>
      </FormProvider>
    </RegisterIntegrationLayout>
  );
};
export default ContactsPage;
