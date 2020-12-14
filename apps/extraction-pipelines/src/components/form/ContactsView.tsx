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

interface OwnProps {}

type Props = OwnProps;
export const StyledForm = styled((props) => (
  <form {...props}>{props.children}</form>
))`
  display: grid;
  grid-template-columns: 1fr;
  .contact-row {
    min-height: 4rem;
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
export const GridRowStyle = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  display: grid;
  grid-template-columns: 8rem 2fr 2fr 5rem 4rem;
  grid-gap: 0.4rem;
  height: 4rem;
  .edit-form-btn {
    align-self: center;
  }
  .cogs-detail {
    padding: 0.75rem;
  }
  .btn-margin-right {
    margin-right: 0.5rem;
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
const authorsSchema = yup.object().shape({
  authors: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Contact name is required'),
      email: yup
        .string()
        .required('Contact email is required')
        .email('Contact email must be a valid email'),
    })
  ),
});

interface ContactsForm extends FieldValues {
  name: string;
  email: string;
}

const ContactsView: FunctionComponent<Props> = () => {
  const { state, dispatch } = useIntegration();
  const { integration } = state;
  const methods = useForm<ContactsForm>({
    resolver: yupResolver(authorsSchema),
    defaultValues: {
      authors: integration?.authors,
    },
  });
  const { control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  const onClickAdd = () => {
    dispatch({ type: 'ADD_AUTHOR', payload: { name: '', email: '' } });
    append({ name: '', email: '' });
  };
  return (
    <>
      <FormProvider {...methods}>
        <StyledForm>
          {fields.map((field, index) => {
            return (
              <ContactView
                key={field.id}
                index={index}
                field={field}
                remove={remove}
              />
            );
          })}
          <Button className="add-btn" variant="outline" onClick={onClickAdd}>
            Add
          </Button>
        </StyledForm>
      </FormProvider>
    </>
  );
};

export default ContactsView;
