import { Body, Button, Checkbox, Flex, Input, Tooltip } from '@cognite/cogs.js';
import {
  BuiltInType,
  DataModelTypeDefsField,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { TypeSelect } from './TypeSelect';
import { SolutionDataModelFieldNameValidator } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { v4 } from 'uuid';
import useSelector from '@platypus-app/hooks/useSelector';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { useDebounce } from '@platypus-app/hooks/useDebounce';
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
  const debouncedFieldName = useDebounce(fieldName, 500);

  useEffect(() => {
    if (!debouncedFieldName || disabled) {
      return;
    }
    const validationResult = nameValidator.validate('name', debouncedFieldName);
    setError(validationResult.valid ? '' : validationResult.errors['name']);
    const isSameFieldPresent = typeFieldNames.some(
      (nameField, i) => nameField === debouncedFieldName && index !== i
    );

    if (!validationResult.valid) {
      setError(validationResult.valid ? '' : validationResult.errors['name']);
    } else if (isSameFieldPresent) {
      setError(t('duplicate_field', 'Duplicate field name'));
    } else {
      onFieldUpdated({ name: debouncedFieldName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFieldName]);

  const nameValidator = new SolutionDataModelFieldNameValidator();
  const error = useSelector(
    (state) => state.dataModel.typeFieldErrors[field.name]
  );
  const { setDataModelFieldErrors } = useDataModelState();
  const setError = useCallback(
    (message: string) => setDataModelFieldErrors(field.name, message),
    [field.name, setDataModelFieldErrors]
  );
  const isCustomType =
    customTypesNames.filter((name) => name === field.type.name).length > 0;

  useEffect(() => {
    return () => {
      setError('');
    };
  }, [setError]);

  const onFieldNameChanged = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    let { value } = e.currentTarget;

    setFieldname(value);
    value = value.trimEnd();

    e.currentTarget?.focus();
  };
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
          autoFocus
          value={fieldName}
          disabled={disabled}
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
            const isCustomTypeSelected =
              customTypesNames.filter((name) => name === value).length > 0;
            onFieldUpdated({
              directives: [],
              type: {
                ...field.type,
                name: value,
                list: isList,
                ...(isCustomTypeSelected
                  ? {
                      nonNull: false,
                    }
                  : {}),
              },
            });
          }}
        />
      </InputWrapper>
      <Flex style={{ width: 110 }}>
        <div style={{ width: 70, textAlign: 'center' }}>
          {isFirstField && (
            <Label level="2">{t('field_label_req', 'Required')}</Label>
          )}
          <Tooltip
            content={
              isCustomType &&
              t(
                'direct_relations_nullable_only_text',
                'Custom type fields can not have `required` attribute'
              )
            }
            disabled={!isCustomType || disabled}
          >
            <Checkbox
              name={`required_${v4()}`}
              data-cy="checkbox-field-required"
              style={{ height: 36, marginLeft: '8px' }}
              disabled={isCustomType || disabled}
              onChange={(isChecked) => {
                onFieldUpdated({
                  type: {
                    ...field.type,
                    nonNull: !isCustomType ? isChecked : false,
                  },
                  nonNull: !isCustomType ? isChecked : false,
                });
              }}
              checked={field.nonNull === true}
            />
          </Tooltip>
        </div>
        <div>
          {isFirstField && <EmptyLabel />}
          {!disabled && (
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
          )}
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
