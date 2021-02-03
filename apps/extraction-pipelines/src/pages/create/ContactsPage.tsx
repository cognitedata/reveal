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
import { INTEGRATIONS } from '../../utils/baseURL';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';

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
  name: string;
  email: string;
  role: string;
  sendNotification: boolean;
}

export const INTEGRATION_CONTACTS_HEADING: Readonly<string> =
  'Integration contacts';
export const EMAIL_REQUIRED: Readonly<string> = 'Email is required';
const contactsSchema = yup.object().shape({
  name: yup.string(),
  email: yup.string().required(EMAIL_REQUIRED),
  role: yup.string(),
  sendNotification: yup.boolean(),
});
const ExternalIdPage: FunctionComponent<ContactsPageProps> = () => {
  const history = useHistory();
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    watch,
  } = useForm<ContactsFormInput>({
    resolver: yupResolver(contactsSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  register('sendNotification');
  const handleNext = () => {
    history.push(createLink(`/${INTEGRATIONS}/create/integration-description`));
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const s = getValues('sendNotification');
    setValue('sendNotification', !s);
  };
  const notification = watch('sendNotification');

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper
        to={createLink(`/${INTEGRATIONS}/create/integration-external-id`)}
      >
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
          <label htmlFor="integration-contacts-name" className="input-label">
            Name
          </label>
          <span id="external-id-hint" className="input-hint" />
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => (
              <span id="contact-name-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-contacts-name"
            name="name"
            type="text"
            ref={register}
            className={`cogs-input ${errors.name ? 'has-error' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby="contact-name-hint contact-name-error"
          />

          <label htmlFor="integration-contacts-email" className="input-label">
            E-mail
          </label>
          <span id="contacts-email-hint" className="input-hint" />
          <ErrorMessage
            errors={errors}
            name="email"
            render={({ message }) => (
              <span id="contact-email-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-contacts-email"
            name="email"
            type="email"
            ref={register}
            className={`cogs-input ${errors.email ? 'has-error' : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby="contact-email-hint contact-email-error"
          />

          <label htmlFor="integration-contacts-role" className="input-label">
            Role
          </label>
          <span id="contacts-role-hint" className="input-hint">
            The role this contact has related to this integration.
          </span>
          <ErrorMessage
            errors={errors}
            name="role"
            render={({ message }) => (
              <span id="contact-email-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-contacts-role"
            name="role"
            type="text"
            ref={register}
            className={`cogs-input ${errors.role ? 'has-error' : ''}`}
            aria-invalid={!!errors.role}
            aria-describedby="contact-role-hint contact-role-error"
          />

          <label
            id="integration-contacts-notification-label"
            htmlFor="integration-contacts-notification"
            className="input-label checkbox-label"
          >
            Notification
          </label>
          <span id="contacts-notification-hint" className="input-hint">
            When turned on, the contact will receive an email if the integration
            fails.
          </span>
          <ErrorMessage
            errors={errors}
            name="sendNotification"
            render={({ message }) => (
              <span id="contact-email-error" className="error-message">
                {message}
              </span>
            )}
          />
          <Switchbutton
            id="integration-contacts-notification"
            name="sendNotification"
            role="switch"
            type="button"
            onClick={handleClick}
            aria-checked={notification ?? false}
            aria-labelledby="integration-contacts-notification-label"
            aria-describedby="contact-notification-hint contact-notification-error"
          >
            <span className="on">On</span>
            <span className="off">Off</span>
          </Switchbutton>

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ExternalIdPage;
