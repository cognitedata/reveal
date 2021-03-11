import React, { FunctionComponent } from 'react';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
import {
  ADD_CONTACT,
  EMAIL_LABEL,
  NAME_LABEL,
  NEXT,
  NOTIFICATION_LABEL,
  REMOVE_CONTACT,
  ROLE_LABEL,
} from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  EXTERNAL_ID_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import { contactsSchema } from '../../utils/validation/contactsSchema';
import { useStoredRegisterIntegration } from '../../hooks/useStoredRegisterIntegration';
import { DivFlex } from '../../styles/flex/StyledFlex';
import { INTEGRATIONS_OVERVIEW_PAGE_PATH } from '../../routing/RoutingConfig';
import { BackBtn } from '../../components/buttons/BackBtn';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { useAppEnv } from '../../hooks/useAppEnv';
import { createUpdateSpec } from '../../utils/contactsUtils';

const ContactWrapper = styled.section`
  display: flex;
  flex-direction: column;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey6'].hex()};
  margin-bottom: 1rem;
`;

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
`;
const Switchbutton = styled.button`
  width: 6rem;
  background: white;
  border: 0.125rem solid ${Colors.primary.hex()};
  border-radius: 0.2rem;
  padding: 0.2rem;
  margin-bottom: 1rem;
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
  .on,
  .off {
    margin: 1rem 0.3rem;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
  &[role='switch'][aria-checked='true'] {
    .on {
      background: ${Colors.primary.hex()};
      color: white;
    }
    .off {
      background: white;
      color: ${Colors.primary.hex()};
    }
  }
  &[role='switch'][aria-checked='false'] {
    .on {
      background: white;
      color: ${Colors.primary.hex()};
    }
    .off {
      background: ${Colors.primary.hex()};
      color: white;
    }
  }
`;

interface ContactsPageProps {}

interface ContactsFormInput {
  contacts: {
    name: string;
    email: string;
    role: string;
    sendNotification: boolean;
  }[];
}

export const INTEGRATION_CONTACTS_HEADING: Readonly<string> =
  'Integration contacts';

const ExternalIdPage: FunctionComponent<ContactsPageProps> = () => {
  const history = useHistory();
  const { project } = useAppEnv();
  const {
    storedIntegration,
    setStoredIntegration,
  } = useStoredRegisterIntegration();
  const { mutate } = useDetailsUpdate();
  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
    getValues,
    watch,
    control,
  } = useForm<ContactsFormInput>({
    resolver: yupResolver(contactsSchema),
    defaultValues: {
      contacts: storedIntegration?.contacts ?? [],
    },
    reValidateMode: 'onSubmit',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });
  const handleNext = async (field: ContactsFormInput) => {
    setStoredIntegration((prev) => ({ ...prev, ...field }));
    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        id: storedIntegration.id,
        fieldName: 'contacts',
        fieldValue: field.contacts ?? [],
      });
      mutate(
        {
          project,
          items,
          id: storedIntegration.id,
        },
        {
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
        }
      );
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

  function removeContact(index: number) {
    return function onClickRemove(_: React.MouseEvent<HTMLButtonElement>) {
      remove(index);
    };
  }

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(INTEGRATIONS_OVERVIEW_PAGE_PATH)}>
        Integration overview
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <BackBtn path={EXTERNAL_ID_PAGE_PATH} />
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <GridH2Wrapper>{INTEGRATION_CONTACTS_HEADING}</GridH2Wrapper>
          <i className="description">
            An integration requires that a contact has set the send
            notification. This is to ensure someone is notified when an error
            occurs.
          </i>
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
                <StyledInput
                  id={`integration-contacts-name-${index}`}
                  name={`contacts[${index}].name`}
                  type="text"
                  ref={register}
                  defaultValue={field.name}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.name ? 'has-error' : ''
                  }`}
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
                <StyledInput
                  id={`integration-contacts-email-${index}`}
                  name={`contacts[${index}].email`}
                  ref={register}
                  defaultValue={field.email}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.email ? 'has-error' : ''
                  }`}
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
                <StyledInput
                  id={`integration-contacts-role-${index}`}
                  name={`contacts[${index}].role`}
                  type="text"
                  ref={register}
                  defaultValue={field.role}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.role ? 'has-error' : ''
                  }`}
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
                      When turned on, the contact will receive an email if the
                      integration fails.
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
                        <Switchbutton
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
                        </Switchbutton>
                      }
                      name={`contacts[${index}].sendNotification`}
                      control={control}
                      defaultValue={field.sendNotification}
                    />
                  </DivFlex>
                  <Button
                    type="secondary"
                    variant="outline"
                    aria-label={REMOVE_CONTACT}
                    onClick={removeContact(index)}
                  >
                    <Icon type="Delete" />
                  </Button>
                </DivFlex>
              </ContactWrapper>
            );
          })}
          <ButtonPlaced type="secondary" htmlType="button" onClick={addContact}>
            {ADD_CONTACT}
          </ButtonPlaced>
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
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ExternalIdPage;
