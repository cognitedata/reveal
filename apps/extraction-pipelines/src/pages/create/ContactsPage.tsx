import React, { FunctionComponent, useEffect } from 'react';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
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
import {
  ADD_CONTACT,
  CONTACTS_DESCRIPTION,
  EMAIL_LABEL,
  NAME_LABEL,
  NEXT,
  NOTIFICATION_HINT,
  NOTIFICATION_LABEL,
  REMOVE_CONTACT,
  ROLE_LABEL,
} from 'utils/constants';
import { CreateFormWrapper, SwitchButton } from 'styles/StyledForm';
import { contactsRule } from 'utils/validation/contactsSchema';
import { useStoredRegisterIntegration } from 'hooks/useStoredRegisterIntegration';
import { DivFlex } from 'styles/flex/StyledFlex';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import {
  EXTERNAL_ID_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { InputController } from 'components/inputs/InputController';

const ContactWrapper = styled.section`
  display: flex;
  flex-direction: column;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey6'].hex()};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

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

export const INTEGRATION_CONTACTS_HEADING: Readonly<string> =
  'Integration contacts';
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
      skipNotificationInHours: storedIntegration?.skipNotificationInMinutes
        ? storedIntegration?.skipNotificationInMinutes / MIN_IN_HOURS
        : undefined,
      hasConfig: storedIntegration?.skipNotificationInMinutes
        ? storedIntegration?.skipNotificationInMinutes > 0
        : false,
    },
    reValidateMode: 'onSubmit',
  });
  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
    getValues,
    watch,
    control,
  } = methods;
  useEffect(() => {
    register('skipNotificationInHours');
    register('hasConfig');
  }, [register]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });
  const handleNext = async (field: ContactsFormInput) => {
    setStoredIntegration({
      ...storedIntegration,
      contacts: field.contacts,
      skipNotificationInMinutes: field.skipNotificationInHours * MIN_IN_HOURS,
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
        message: 'No id. Select an integration',
        shouldFocus: true,
      });
    }
  };
  const handleClick = (index: number) => {
    const s = getValues(`contacts[${index}].sendNotification`) ?? false;
    setValue(`contacts[${index}].sendNotification`, !s);
  };
  const calcChecked = (index: number): boolean => {
    return watch(`contacts[${index}].sendNotification`) ?? false;
  };

  const addContact = () => {
    append({ name: '', email: '', role: '', sendNotification: false });
  };

  const removeContact = (index: number) => {
    return function onClickRemove(_: React.MouseEvent<HTMLButtonElement>) {
      remove(index);
    };
  };

  return (
    <RegisterIntegrationLayout backPath={EXTERNAL_ID_PAGE_PATH}>
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)} inputWidth={50}>
          <GridH2Wrapper>{INTEGRATION_CONTACTS_HEADING}</GridH2Wrapper>
          <i className="description">{CONTACTS_DESCRIPTION}</i>
          {fields.map((field, index) => {
            return (
              <ContactWrapper role="group" key={field.id}>
                <label
                  htmlFor={`integration-contacts-name-${index}`}
                  className="input-label"
                >
                  {NAME_LABEL}
                </label>
                <span id="external-id-hint" className="input-hint" />
                <ErrorMessage
                  errors={errors}
                  name={`contacts[${index}].name`}
                  render={({ message }) => (
                    <span
                      id={`contact-${index}-name-error`}
                      className="error-message"
                    >
                      {message}
                    </span>
                  )}
                />
                <InputController
                  name={`contacts[${index}].name`}
                  control={control}
                  inputId={`integration-contacts-name-${index}`}
                  defaultValue={field.name}
                  aria-invalid={!!errors.contacts?.[index]?.name}
                  aria-describedby={`contact-name-hint contact-${index}-name-error`}
                />

                <label
                  htmlFor={`integration-contacts-email-${index}`}
                  className="input-label"
                >
                  {EMAIL_LABEL}
                </label>
                <span id="contacts-email-hint" className="input-hint" />
                <ErrorMessage
                  errors={errors}
                  name={`contacts[${index}].email`}
                  render={({ message }) => (
                    <span
                      id={`contact-${index}-email-error`}
                      className="error-message"
                    >
                      {message}
                    </span>
                  )}
                />
                <InputController
                  name={`contacts[${index}].email`}
                  control={control}
                  inputId={`integration-contacts-email-${index}`}
                  defaultValue={field.email}
                  aria-invalid={!!errors.contacts?.[index]?.email}
                  aria-describedby={`contact-email-hint contact-${index}-email-error`}
                />
                <label
                  htmlFor={`integration-contacts-role-${index}`}
                  className="input-label"
                >
                  {ROLE_LABEL}
                </label>
                <span id="contacts-role-hint" className="input-hint">
                  The role this contact has related to this integration.
                </span>
                <ErrorMessage
                  errors={errors}
                  name={`contacts[${index}].role`}
                  render={({ message }) => (
                    <span
                      id={`contact-${index}-role-error`}
                      className="error-message"
                    >
                      {message}
                    </span>
                  )}
                />
                <InputController
                  name={`contacts[${index}].role`}
                  control={control}
                  inputId={`integration-contacts-role-${index}`}
                  defaultValue={field.role}
                  aria-invalid={!!errors.contacts?.[index]?.role}
                  aria-describedby={`contact-role-hint contact-${index}-role-error`}
                />
                <DivFlex direction="row" justify="space-between">
                  <DivFlex direction="column" align="flex-start">
                    <label
                      id="integration-contacts-notification-label"
                      htmlFor={`integration-contacts-notification-${index}`}
                      className="input-label checkbox-label"
                    >
                      {NOTIFICATION_LABEL}
                    </label>
                    <span
                      id={`contacts-${index}-notification-hint`}
                      className="input-hint"
                    >
                      {NOTIFICATION_HINT}
                    </span>
                    <ErrorMessage
                      errors={errors}
                      name={`contacts[${index}].sendNotification`}
                      render={({ message }) => (
                        <span
                          id={`contact-${index}-notification-error`}
                          className="error-message"
                        >
                          {message}
                        </span>
                      )}
                    />

                    <Controller
                      as={
                        <SwitchButton
                          id={`integration-contacts-notification-${index}`}
                          role="switch"
                          type="button"
                          ref={register}
                          onClick={() => handleClick(index)}
                          aria-checked={calcChecked(index)}
                          aria-labelledby="integration-contacts-notification-label"
                          aria-describedby={`contact-${index}-notification-hint contact-${index}-notification-error`}
                        >
                          <span className="on">On</span>
                          <span className="off">Off</span>
                        </SwitchButton>
                      }
                      name={`contacts[${index}].sendNotification`}
                      control={control}
                      defaultValue={field.sendNotification}
                    />
                  </DivFlex>
                  <Button
                    type="tertiary"
                    aria-label={REMOVE_CONTACT}
                    onClick={removeContact(index)}
                  >
                    <Icon type="Delete" />
                  </Button>
                </DivFlex>
              </ContactWrapper>
            );
          })}
          <ButtonPlaced
            mb={2}
            type="secondary"
            htmlType="button"
            onClick={addContact}
          >
            {ADD_CONTACT}
          </ButtonPlaced>
          <NotificationConfig />
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
