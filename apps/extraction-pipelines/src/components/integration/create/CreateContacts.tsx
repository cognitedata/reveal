import React, { FunctionComponent, PropsWithoutRef, ReactNode } from 'react';
import {
  ADD_CONTACT,
  CONTACTS_DESCRIPTION,
  EMAIL_LABEL,
  NAME_LABEL,
  NOTIFICATION_HINT,
  NOTIFICATION_LABEL,
  REMOVE_CONTACT,
  ROLE_LABEL,
} from 'utils/constants';
import { ErrorMessage } from '@hookform/error-message';
import { DivFlex } from 'styles/flex/StyledFlex';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Hint, StyledLabel } from 'styles/StyledForm';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { ButtonPlaced, SwitchButton } from 'styles/StyledButton';
import styled from 'styled-components';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { FullInput } from 'components/inputs/FullInput';

const ContactWrapper = styled.section`
  display: flex;
  flex-direction: column;
  border-bottom: 0.125rem solid ${Colors['greyscale-grey6'].hex()};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;
interface CreateContactsProps {
  renderLabel?: (labelText: string, inputId: string) => ReactNode;
}

export const CreateContacts: FunctionComponent<CreateContactsProps> = ({
  renderLabel = (labelText, inputId) => (
    <StyledLabel htmlFor={inputId}>{labelText}</StyledLabel>
  ),
}: PropsWithoutRef<CreateContactsProps>) => {
  const {
    formState: { errors },
    watch,
    control,
    getValues,
    setValue,
    register,
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });
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
    <>
      {renderLabel(TableHeadings.CONTACTS, 'contacts')}
      <Hint>{CONTACTS_DESCRIPTION}</Hint>
      {fields.map((field, index) => {
        return (
          <ContactWrapper role="group" key={field.id}>
            <FullInput
              name={`contacts[${index}].name`}
              inputId={`integration-contacts-name-${index}`}
              defaultValue=""
              control={control}
              errors={errors}
              labelText={NAME_LABEL}
            />
            <FullInput
              name={`contacts[${index}].email`}
              inputId={`integration-contacts-email-${index}`}
              defaultValue=""
              control={control}
              errors={errors}
              labelText={EMAIL_LABEL}
            />

            <FullInput
              name={`contacts[${index}].role`}
              inputId={`integration-contacts-role-${index}`}
              defaultValue=""
              control={control}
              errors={errors}
              labelText={ROLE_LABEL}
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
                  render={() => {
                    return (
                      <SwitchButton
                        id={`integration-contacts-notification-${index}`}
                        role="switch"
                        type="button"
                        ref={
                          register(`contacts[${index}].sendNotification`).ref
                        }
                        onClick={() => handleClick(index)}
                        aria-checked={calcChecked(index)}
                        aria-labelledby="integration-contacts-notification-label"
                        aria-describedby={`contact-${index}-notification-hint contact-${index}-notification-error`}
                      >
                        <span className="on">On</span>
                        <span className="off">Off</span>
                      </SwitchButton>
                    );
                  }}
                  name={`contacts[${index}].sendNotification`}
                  control={control}
                  defaultValue={false}
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
        marginbottom={2}
        type="secondary"
        htmlType="button"
        onClick={addContact}
      >
        {ADD_CONTACT}
      </ButtonPlaced>
    </>
  );
};
