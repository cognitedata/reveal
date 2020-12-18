import React, { FunctionComponent, useState } from 'react';
import { Button, Detail } from '@cognite/cogs.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import ErrorMessageDialog from 'components/buttons/ErrorMessageDialog';
import { TableHeadings } from '../table/IntegrationTableCol';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { createUpdateSpec } from '../../utils/contactsUtils';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { AlignedSpan, ContactBtnTestIds } from './ContactsView';
import { PaddedGridForm } from '../../styles/grid/StyledGrid';
import InputWithWarning from '../inputs/InputWithWarning';

interface OwnProps {}

type Props = OwnProps;
export const StyledForm = styled((props) => (
  <PaddedGridForm {...props}>{props.children}</PaddedGridForm>
))`
  grid-template-columns: 8rem 3fr 5rem 4rem;
`;
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
});
const NameView: FunctionComponent<Props> = () => {
  const {
    state: { integration, updates },
    dispatch,
  } = useIntegration();
  const [isEdit, setIsEdit] = useState(false);
  const { project } = useAppEnv();
  const [mutateContacts] = useDetailsUpdate();
  const [errorVisible, setErrorVisible] = useState(false);

  const { register, errors, trigger, getValues } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: integration?.name,
    },
  });
  const isDirtyName = updates.has(`name-0`);

  const onSave = async () => {
    const valid = await trigger();
    const name = getValues('name');
    if (valid && integration && project && name) {
      const items = createUpdateSpec({
        id: integration.id,
        fieldValue: name,
        fieldName: 'name',
      });
      await mutateContacts(
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
            dispatch({ type: 'UPDATE_NAME', payload: { name } });
            dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'name' } });
            setIsEdit(false);
          },
        }
      );
    }
  };

  function onCancel() {
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'name' } });
    setIsEdit(false);
  }

  const onEditClick = () => {
    setIsEdit(true);
  };

  const handleChange = (_: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'ADD_CHANGE', payload: { name: 'name' } });
  };

  const handleClickError = () => {
    setErrorVisible(false);
    dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'name' } });
    setIsEdit(false);
  };

  return (
    <StyledForm className="row-style-even row-height-4">
      <Detail strong>{TableHeadings.NAME}</Detail>
      {isEdit ? (
        <InputWithWarning
          name="name"
          placeholder="Enter name of integration"
          handleChange={handleChange}
          register={register}
          defaultValue={integration?.name}
          errors={errors}
          isDirty={isDirtyName}
        />
      ) : (
        <AlignedSpan>{integration?.name}</AlignedSpan>
      )}
      {isEdit ? (
        <>
          <Button
            variant="default"
            className="edit-form-btn"
            onClick={onCancel}
            aria-controls="name"
            data-testid={`${ContactBtnTestIds.CANCEL_BTN}name`}
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
              aria-controls="name"
              data-testid={`${ContactBtnTestIds.SAVE_BTN}name`}
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
            aria-controls="name"
            data-testid={`${ContactBtnTestIds.EDIT_BTN}name`}
          >
            Edit
          </Button>
        </>
      )}
    </StyledForm>
  );
};

export default NameView;
