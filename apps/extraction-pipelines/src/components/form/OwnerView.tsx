import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Detail, Tooltip } from '@cognite/cogs.js';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { createUpdateSpec } from '../../utils/contactsUtils';
import { AlignedSpan } from './ContactsView';
import { DetailFieldNames } from '../../model/Integration';
import ErrorMessageDialog from '../buttons/ErrorMessageDialog';
import EmailLink from '../buttons/EmailLink';
import {
  EMAIL_NOTIFICATION_TOOLTIP,
  EMAIL_PLACEHOLDER,
  NAME_PLACEHOLDER,
} from '../../utils/constants';
import { CheckboxWithRef } from '../inputs/CheckboxWithRef';
import { InputWithError } from '../inputs/InputWithError';
import { InputWarningIcon } from '../icons/InputWarningIcon';
import { GridRowStyle } from '../../styles/grid/StyledGrid';

interface OwnProps {}

type Props = OwnProps;

export const AlignedDetail = styled((props) => (
  <Detail {...props}>{props.children}</Detail>
))`
  align-self: center;
`;
const schema = yup.object().shape({
  name: yup.string().required('Owner name is required'),
  email: yup
    .string()
    .required('Owner email is required')
    .email('Owner email must be a valid email'),
});

interface OwnerForm extends FieldValues {
  name: string;
  email: string;
  sendNotification: boolean;
}

const OwnerView: FunctionComponent<Props> = () => {
  const {
    state: { integration, updates },
    dispatch,
  } = useIntegration();
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const { register, errors, getValues, trigger, setValue } = useForm<OwnerForm>(
    {
      resolver: yupResolver(schema),
      defaultValues: {
        name: integration?.owner.name,
        email: integration?.owner.email,
        sendNotification: integration?.owner.sendNotification,
      },
    }
  );
  const isDirty = updates.has('owner-0');
  async function onSave() {
    const valid = await trigger();

    if (valid && project && integration) {
      const owner = getValues();
      const items = createUpdateSpec({
        id: integration.id,
        fieldName: 'owner',
        fieldValue: owner,
      });
      await mutate(
        {
          project,
          items,
          id: integration.id,
        },
        {
          onError: () => {
            setErrorVisible(true);
          },
          onSuccess: () => {
            dispatch({ type: 'UPDATE_OWNER', payload: { owner } });
            dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
            setIsEdit(false);
          },
        }
      );
    }
  }

  function onCancel() {
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
    setValue('sendNotification', integration?.owner.sendNotification);
    setIsEdit(false);
  }
  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'owner' } });
    setIsEdit(false);
  };

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleChange = () => {
    dispatch({ type: 'ADD_CHANGE', payload: { name: 'owner' } });
  };

  return (
    <>
      <GridRowStyle className="row-style-odd">
        <AlignedDetail id="role-owner" strong role="gridcell" aria-colindex={1}>
          {DetailFieldNames.OWNER}
        </AlignedDetail>
        <Tooltip content={EMAIL_NOTIFICATION_TOOLTIP} disabled={isEdit}>
          <CheckboxWithRef
            name="sendNotification"
            disabled={!isEdit}
            handleChange={handleChange}
            defaultChecked={integration?.owner.sendNotification}
            register={register}
            aria-label={EMAIL_NOTIFICATION_TOOLTIP}
          />
        </Tooltip>
        {isEdit ? (
          <InputWithError
            name="name"
            placeholder={NAME_PLACEHOLDER}
            handleChange={handleChange}
            register={register}
            defaultValue={integration?.owner.name}
            errors={errors}
            aria-labelledby="role-owner contacts-heading-name"
          />
        ) : (
          <AlignedSpan
            role="gridcell"
            aria-colindex={2}
            aria-describedby="role-owner contacts-heading-name"
          >
            {integration?.owner.name}
          </AlignedSpan>
        )}

        {isEdit ? (
          <InputWithError
            name="email"
            placeholder={EMAIL_PLACEHOLDER}
            handleChange={handleChange}
            register={register}
            defaultValue={integration?.owner.email}
            errors={errors}
            aria-labelledby="role-owner contacts-heading-email"
          />
        ) : (
          <AlignedSpan
            role="gridcell"
            aria-colindex={3}
            aria-describedby="role-owner contacts-heading-email"
          >
            <EmailLink email={integration?.owner.email} />
          </AlignedSpan>
        )}
        {isDirty ? (
          <InputWarningIcon
            $color={Colors.warning.hex()}
            data-testid="warning-icon-owner"
            className="waring"
          />
        ) : (
          <span />
        )}
        {isEdit ? (
          <>
            <Button
              className="edit-form-btn"
              variant="default"
              onClick={onCancel}
              aria-controls="name email"
            >
              Cancel
            </Button>
            <ErrorMessageDialog
              visible={errorVisible}
              handleClickError={handleClickError}
            >
              <Button
                className="edit-form-btn btn-margin-right"
                type="primary"
                onClick={onSave}
                aria-controls="name email"
              >
                Save
              </Button>
            </ErrorMessageDialog>
          </>
        ) : (
          <>
            <span />
            <Button
              onClick={onEditClick}
              type="primary"
              className="edit-form-btn btn-margin-right"
              title="Toggle edit row"
              aria-label="Edit btn should have label"
              aria-expanded={isEdit}
              aria-controls="name email"
            >
              Edit
            </Button>
          </>
        )}
      </GridRowStyle>
    </>
  );
};

export default OwnerView;
