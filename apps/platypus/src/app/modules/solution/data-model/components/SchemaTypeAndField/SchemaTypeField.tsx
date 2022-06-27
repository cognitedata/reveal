import { Body, Button, Checkbox, Flex, Input } from '@cognite/cogs.js';
import {
  BuiltInType,
  DataModelTypeDefsField,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { TypeSelect } from './TypeSelect';
import { SolutionDataModelFieldNameValidator } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import debounce from 'lodash/debounce';
import { v4 } from 'uuid';
export interface SchemaTypeFieldProps {
  index: number;
  field: DataModelTypeDefsField;
  builtInTypes: BuiltInType[];
  customTypesNames: string[];
  typeFieldNames: string[];
  disabled?: boolean;
  onFieldUpdated: (field: Partial<UpdateDataModelFieldDTO>) => void;
  onFieldRemoved: (field: DataModelTypeDefsField) => void;
}

export const SchemaTypeField = ({
  field,
  builtInTypes,
  customTypesNames,
  disabled = false,
  typeFieldNames,
  onFieldUpdated,
  index,
  onFieldRemoved,
}: SchemaTypeFieldProps) => {
  const [fieldName, setFieldname] = useState(field.name);
  const { t } = useTranslation('UiEditorTypeField');
  const [error, setError] = useState('');
  const nameValidator = new SolutionDataModelFieldNameValidator();

  const fieldNameDebounced = useCallback(
    debounce((value: string) => {
      const isSameFieldPresent = typeFieldNames.some(
        (nameField, i) => nameField === value && index !== i
      );
      if (isSameFieldPresent) {
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
  const isFirstField = index === 0;
  return (
    <Flex
      gap={8}
      justifyContent="space-between"
      style={{
        paddingLeft: 16,
        paddingRight: 10,
      }}
    >
      <InputWrapper data-cy={`data_model_type_field_${fieldName}`}>
        {isFirstField && (
          <Label level="2"> {t('field_name_label', 'Field name')}</Label>
        )}
        <Input
          data-cy="schema-type-field"
          fullWidth
          autoFocus={!fieldName}
          value={fieldName}
          disabled={disabled}
          onClick={(event) => event.currentTarget.select()}
          onChange={onFieldNameChanged}
          css={{}}
          error={error}
        />
      </InputWrapper>
      <InputWrapper>
        {isFirstField && (
          <Label level="2">{t('field_type_label', 'Type')}</Label>
        )}
        <TypeSelect
          field={field}
          builtInTypes={builtInTypes}
          customTypesNames={customTypesNames}
          disabled={disabled}
          onValueChanged={({ value, isList }) => {
            onFieldUpdated({
              directives: [],
              type: {
                ...field.type,
                name: value,
                list: isList,
              },
            });
          }}
        />
      </InputWrapper>
      <Flex style={{ width: 110 }}>
        <div style={{ width: 70 }}>
          {isFirstField && (
            <Label level="2">{t('field_label_req', 'Required')}</Label>
          )}
          <Checkbox
            name={`required_${v4()}`}
            data-cy="checkbox-field-required"
            style={{ height: 36, marginLeft: 20 }}
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
        </div>
        <div>
          {isFirstField && <EmptyLabel />}
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
        </div>
      </Flex>
    </Flex>
  );
};

const Label = styled(Body)`
  margin-bottom: 12px;
`;
const EmptyLabel = styled(Body)`
  margin-bottom: 12px;
  height: 20px;
  width: 36px;
`;
const InputWrapper = styled.div`
  flex: 1;
  margin-right: 10px;
  .cogs-menu-divider {
    width: 100%;
  }
`;
