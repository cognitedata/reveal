import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Detail } from '@cognite/cogs.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { TableHeadings } from '../table/IntegrationTableCol';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { createUpdateSpec } from '../../utils/contactsUtils';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import ValidationError from './ValidationError';
import { InputWarningIcon } from '../inputs/InputWarningIcon';
import { AlignedSpan } from './ContactsView';
import { InputWarningError } from './ContactView';

interface OwnProps {}

type Props = OwnProps;
export const StyledForm = styled((props) => (
  <form {...props}>{props.children}</form>
))`
  display: grid;
  grid-template-columns: 8rem 3fr 5rem 4rem;
  grid-gap: 0.4rem;
  .btn-margin-right {
    margin-right: 0.75rem;
  }
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
      await mutateContacts({
        project,
        items,
        id: integration.id,
      });

      dispatch({ type: 'UPDATE_NAME', payload: { name } });
      dispatch({ type: 'REMOVE_CHANGE', payload: { name: 'name' } });
      setIsEdit(false);
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
  return (
    <StyledForm className="detail-row">
      <Detail strong>{TableHeadings.NAME}: </Detail>
      {isEdit ? (
        <InputWarningError>
          <input
            type="text"
            onChange={handleChange}
            id="name"
            name="name"
            placeholder="Enter name of integration"
            className={`cogs-input full-width ${errors.name && 'has-error'}`}
            ref={register}
            defaultValue={integration?.name}
          />
          {isDirtyName && (
            <InputWarningIcon
              $color={Colors.warning.hex()}
              data-testid="warning-icon-desciption"
              className="waring"
            />
          )}
          <ValidationError errors={errors} name="name" />
        </InputWarningError>
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
          >
            Cancel
          </Button>
          <Button
            className="edit-form-btn btn-margin-right"
            type="primary"
            onClick={onSave}
            aria-controls="name"
          >
            Save
          </Button>
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
          >
            Edit
          </Button>
        </>
      )}
    </StyledForm>
  );
};

export default NameView;
