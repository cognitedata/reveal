import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
import { ADD_CONTACT, NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  DESCRIPTION_PAGE_PATH,
  EXTERNAL_ID_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import { contactsSchema } from '../../utils/validation/contactsSchema';

const StyledBtn = styled(Button)`
  align-self: flex-start;
`;
const AddContact = styled(StyledBtn)`
  margin-bottom: 1rem;
`;
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
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    watch,
    control,
  } = useForm<ContactsFormInput>({
    resolver: yupResolver(contactsSchema),
    defaultValues: {
      contacts: [],
    },
    reValidateMode: 'onSubmit',
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'contacts',
  });

  const handleNext = () => {
    history.push(createLink(DESCRIPTION_PAGE_PATH));
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

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(EXTERNAL_ID_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_CONTACTS_HEADING}</GridH2Wrapper>
        <i className="description">
          An integration requires that a contact has set the send notification.
          This is to ensure someone is notified when an error occurs.
        </i>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          {fields.map((field, index) => {
            return (
              <ContactWrapper role="group" key={field.id}>
                <label
                  htmlFor="integration-contacts-name"
                  className="input-label"
                >
                  Name
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
                  id="integration-contacts-name"
                  name={`contacts[${index}].name`}
                  type="text"
                  ref={register}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.name ? 'has-error' : ''
                  }`}
                  aria-invalid={!!errors.contacts?.[index]?.name}
                  aria-describedby={`contact-name-hint contact-${index}-name-error`}
                />

                <label
                  htmlFor="integration-contacts-email"
                  className="input-label"
                >
                  E-mail
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
                  id="integration-contacts-email"
                  name={`contacts[${index}].email`}
                  type="email"
                  ref={register}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.email ? 'has-error' : ''
                  }`}
                  aria-invalid={!!errors.contacts?.[index]?.email}
                  aria-describedby={`contact-email-hint contact-${index}-email-error`}
                />

                <label
                  htmlFor="integration-contacts-role"
                  className="input-label"
                >
                  Role
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
                  id="integration-contacts-role"
                  name={`contacts[${index}].role`}
                  type="text"
                  ref={register}
                  className={`cogs-input ${
                    errors.contacts?.[index]?.role ? 'has-error' : ''
                  }`}
                  aria-invalid={!!errors.contacts?.[index]?.role}
                  aria-describedby={`contact-role-hint contact-${index}-role-error`}
                />

                <label
                  id="integration-contacts-notification-label"
                  htmlFor="integration-contacts-notification"
                  className="input-label checkbox-label"
                >
                  Notification
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
                      id="integration-contacts-notification"
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
              </ContactWrapper>
            );
          })}
          <AddContact
            type="secondary"
            htmlType="button"
            onClick={() => addContact()}
          >
            {ADD_CONTACT}
          </AddContact>
          <StyledBtn type="primary" htmlType="submit">
            {NEXT}
          </StyledBtn>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ExternalIdPage;
