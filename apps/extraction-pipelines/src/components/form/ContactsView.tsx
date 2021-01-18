import React, { FunctionComponent } from 'react';
import { Button, Colors, Detail } from '@cognite/cogs.js';
import {
  FieldValues,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import ContactView from './ContactView';

export const ContactBtnTestIds = {
  EDIT_BTN: 'edit-contact-btn-',
  REMOVE_BTN: 'remove-contact-btn-',
  CANCEL_BTN: 'cancel-contact-btn-',
  SAVE_BTN: 'save-contact-btn-',
};

interface OwnProps {}

type Props = OwnProps;
export const StyledForm = styled((props) => (
  <form {...props}>{props.children}</form>
))`
  display: grid;
  grid-template-columns: 1fr;
  .row-height-4 {
    min-height: 4rem;
  }
  .row-style-odd {
    &:hover {
      background-color: ${Colors['greyscale-grey3'].hex()};
    }
    &:nth-child(odd) {
      background-color: ${Colors['greyscale-grey2'].hex()};
      &:hover {
        background-color: ${Colors['greyscale-grey3'].hex()};
      }
    }
  }
  .add-btn {
    justify-self: flex-end;
    margin: 1rem 0.75rem;
  }
`;

export const AlignedDetail = styled((props) => (
  <Detail {...props}>{props.children}</Detail>
))`
  align-self: center;
`;
export const AlignedSpan = styled((props) => (
  <span {...props}>{props.children}</span>
))`
  align-self: center;
`;

export const ContactsErrorMsg = {
  NAME_REQUIRED: 'Contact name is required',
  EMAIL_REQUIRED: 'Contact email is required',
  EMAIL_INVALID: 'Contact email must be a valid email',
};

const contactsSchema = yup.object().shape({
  contacts: yup.array().of(
    yup.object().shape({
      name: yup.string().required(ContactsErrorMsg.NAME_REQUIRED),
      email: yup
        .string()
        .required(ContactsErrorMsg.EMAIL_REQUIRED)
        .email(ContactsErrorMsg.EMAIL_INVALID),
    })
  ),
});

interface ContactsForm extends FieldValues {
  name: string;
  email: string;
  sendNotification: boolean;
}

const ContactsView: FunctionComponent<Props> = () => {
  const { state, dispatch } = useIntegration();
  const { integration } = state;
  const methods = useForm<ContactsForm>({
    resolver: yupResolver(contactsSchema),
    defaultValues: {
      contacts: integration?.contacts ?? [],
    },
  });
  const { control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  const onClickAdd = () => {
    dispatch({
      type: 'ADD_CONTACT',
      payload: { name: '', email: '', sendNotification: false },
    });
    append({ name: '', email: '', sendNotification: false });
  };
  return (
    <>
      <FormProvider {...methods}>
        <StyledForm>
          {fields.map((field, index) => {
            return (
              <ContactView
                key={field?.id ?? `noId${index}`}
                index={index}
                field={field}
                remove={remove}
              />
            );
          })}
          <Button
            className="add-btn"
            variant="outline"
            onClick={onClickAdd}
            data-testid="add-contact-btn"
          >
            Add
          </Button>
        </StyledForm>
      </FormProvider>
    </>
  );
};

export default ContactsView;
