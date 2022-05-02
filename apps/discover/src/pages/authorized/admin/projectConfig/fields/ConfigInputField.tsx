import React, { ChangeEvent, useState, useCallback } from 'react';

import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';

import { Input, Textarea, toast } from '@cognite/cogs.js';

import { showErrorMessage } from 'components/Toast';

import { HandleConfigChange, MetadataValue } from '../types';

import { Switch } from './Switch';

export const ConfigInputField: React.FC<{
  changeKey: string;
  field: MetadataValue;
  onChange: HandleConfigChange;
  value?: unknown;
  error?: string | boolean;
}> = ({ field, onChange, value, changeKey, error }) => {
  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(changeKey, event.target.value);
    },
    [changeKey, onChange]
  );

  const handleNumberChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(
        changeKey,
        event.target.value ? Number(event.target.value) : undefined
      );
    },
    [changeKey, onChange]
  );

  const [jsonValue, setJSONValue] = useState<string | undefined>(
    value ? JSON.stringify(value, undefined, 4) : undefined // 4 is space for prettifying json
  );

  const handleJSONChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      toast.dismiss();
      setJSONValue(event.target.value);
    },
    []
  );

  const handleJSONBlur = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      let changedJSON;

      try {
        changedJSON = event.target.value
          ? JSON.parse(event.target.value)
          : undefined;

        if (!isEqual(value, changedJSON)) {
          onChange(changeKey, changedJSON);
        }
      } catch (e) {
        showErrorMessage('Please enter valid JSON.');
      }
    },
    [value, onChange, changeKey]
  );

  const handleSwitchChange = useCallback(
    (switchValue: boolean) => {
      onChange(changeKey, switchValue);
    },
    [changeKey, onChange]
  );

  switch (field.type) {
    case 'string':
      return (
        <Input
          id={changeKey}
          name={field.label}
          error={error}
          helpText={field.helpText}
          placeholder={field.placeholder ?? field.label}
          title={field.label}
          value={isUndefined(value) ? '' : (value as string)}
          onChange={handleTextChange}
          data-testid={`${changeKey}-value`}
        />
      );
    case 'number':
      return (
        <Input
          id={changeKey}
          name={field.label}
          error={error}
          helpText={field.helpText}
          type="number"
          placeholder={field.placeholder ?? field.label}
          title={field.label}
          value={value as number}
          onChange={handleNumberChange}
          data-testid={`${changeKey}-value`}
        />
      );
    case 'boolean':
      return (
        <Switch
          name={changeKey}
          handleChange={handleSwitchChange}
          value={Boolean(value)}
          label={field.label}
          helpText={field.helpText}
        />
      );
    case 'object':
    case 'array':
      if (field.renderAsJSON) {
        return (
          <Textarea
            className="config-textarea-container"
            style={{
              height: 300,
              width: 650,
            }}
            id={changeKey}
            name={field.label}
            helpText={field.helpText}
            placeholder={field.placeholder ?? field.label}
            title={field.label}
            value={jsonValue as string}
            onChange={handleJSONChange}
            onBlur={handleJSONBlur}
            data-testid={`${changeKey}-value`}
          />
        );
      }
      return null;
    default:
      return null;
  }
};
