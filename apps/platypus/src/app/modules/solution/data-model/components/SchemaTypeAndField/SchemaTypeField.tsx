import { Button, Checkbox, Flex, Input } from '@cognite/cogs.js';
import {
  BuiltInType,
  SolutionDataModelField,
  UpdateSolutionDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { TypeSelect } from './TypeSelect';
import { SolutionDataModelFieldNameValidator } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import debounce from 'lodash/debounce';
import { v4 } from 'uuid';

export interface SchemaTypeFieldProps {
  field: SolutionDataModelField;
  builtInTypes: BuiltInType[];
  customTypesNames: string[];
  typeFieldNames: string[];
  disabled?: boolean;
  onFieldUpdated: (field: Partial<UpdateSolutionDataModelFieldDTO>) => void;
  onFieldRemoved: (field: SolutionDataModelField) => void;
}
export const SchemaTypeField = ({
  field,
  builtInTypes,
  customTypesNames,
  disabled = false,
  typeFieldNames,
  onFieldUpdated,
  onFieldRemoved,
}: SchemaTypeFieldProps) => {
  const [fieldName, setFieldname] = useState(field.name);
  const { t } = useTranslation('UiEditorTypeField');
  const [error, setError] = useState('');
  const nameValidator = new SolutionDataModelFieldNameValidator();

  const fieldNameDebounced = useCallback(
    debounce((value: string) => {
      if (typeFieldNames.includes(value)) {
        setError(t('duplicate_field', 'Duplicate field name'));
      } else {
        onFieldUpdated({ name: value });
      }
    }, 500),
    [field.name]
  );

  const onFieldNameChanged = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();

      const { value } = e.currentTarget;

      setFieldname(value);

      const validationResult = nameValidator.validate('name', value);
      setError(validationResult.valid ? '' : validationResult.errors['name']);
      if (validationResult.valid) {
        fieldNameDebounced(value);
      }
      e.currentTarget?.focus();
    },
    [fieldNameDebounced]
  );

  return (
    <Flex
      gap={8}
      justifyContent="space-between"
      style={{ paddingLeft: 16, paddingRight: 10 }}
    >
      <InputWrapper>
        <Input
          data-cy="schema-type-field"
          fullWidth
          autoFocus
          value={fieldName}
          disabled={disabled}
          required
          onClick={(event) => event.currentTarget.select()}
          onChange={onFieldNameChanged}
          error={error}
        />
      </InputWrapper>
      <InputWrapper>
        <TypeSelect
          field={field}
          builtInTypes={builtInTypes}
          customTypesNames={customTypesNames}
          disabled={disabled}
          onValueChanged={(value) => {
            onFieldUpdated({
              type: { ...field.type, name: value },
            });
          }}
        />
      </InputWrapper>

      <Flex>
        <Checkbox
          name={`required_${v4()}`}
          data-cy="checkbox-field-required"
          style={{ height: 36, marginLeft: 16 }}
          disabled={disabled}
          onChange={(isChecked) => {
            onFieldUpdated({
              type: {
                ...field.type,
                nonNull: isChecked,
              },
              nonNull: isChecked,
            });
          }}
          checked={field.nonNull === true}
        />

        <Button
          icon="Delete"
          aria-label="Delete field"
          type="ghost"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            onFieldRemoved(field);
          }}
        />
      </Flex>
    </Flex>
  );
};

const InputWrapper = styled.div`
  width: 240px;
  .cogs-menu-divider {
    width: 100%;
  }
`;
