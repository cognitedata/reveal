import { Body, Button, Checkbox, Flex, Input } from '@cognite/cogs.js';
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
import { FieldDirectiveSelect } from '../FieldDirective/FieldDirectiveSelect';
import config from '@platypus-app/config/config';

export interface SchemaTypeFieldProps {
  index: number;
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
  index,
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
  const isFirstField = index === 0;
  return (
    <Flex gap={8} justifyContent="space-between" className="pl-4 pr-2.5">
      <InputWrapper>
        {isFirstField && (
          <Label level="2"> {t('field_name_label', 'Field name')}</Label>
        )}
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
      {config.USE_MIXER_API && (
        <div>
          {isFirstField && (
            <Label level="2">{t('field_label_attributes', 'Attributes')}</Label>
          )}
          <FieldDirectiveSelect
            disabled={disabled}
            builtInTypes={builtInTypes}
            field={field}
            onSelect={(directive) => {
              if (field.directives?.some((d) => d.name === directive)) {
                onFieldUpdated({
                  directives: field.directives.filter(
                    (d) => d.name !== directive
                  ),
                });
              } else {
                onFieldUpdated({
                  directives: [
                    ...(field.directives || []),
                    { name: directive, arguments: [] },
                  ],
                });
              }
            }}
          />
        </div>
      )}
      <Flex style={{ width: 80 }}>
        <div style={{ width: 40 }}>
          {isFirstField && (
            <Label level="2">{t('field_label_req', 'Rqd[!].')}</Label>
          )}
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
