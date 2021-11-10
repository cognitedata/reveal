import React, { ChangeEvent, useState, useCallback } from 'react';

import { Input, Switch, Textarea, toast } from '@cognite/cogs.js';

import { showErrorMessage } from 'components/toast';

import { HandleConfigChange, MetadataKey, MetadataValue } from './types';

export const ConfigInputField: React.FC<{
  field: MetadataValue;
  fieldKey: MetadataKey;
  prefix: string;
  onReset?: () => void;
  onChange: HandleConfigChange;
  value?: unknown;
}> = ({ field, onChange, prefix, fieldKey, value }) => {
  const changeKey = `${prefix}.${fieldKey}`;
  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(changeKey, event.target.value);
    },
    [changeKey]
  );

  const handleNumberChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(changeKey, Number(event.target.value));
    },
    [changeKey]
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
        changedJSON = JSON.parse(event.target.value);
        onChange(changeKey, changedJSON);
      } catch (e) {
        showErrorMessage('Please enter valid JSON');
      }
    },
    [changeKey]
  );

  const handleSwitchChange = useCallback(
    (switchValue: boolean) => {
      onChange(changeKey, switchValue);
    },
    [changeKey]
  );

  switch (field.type) {
    case 'string':
      return (
        <Input
          id={changeKey}
          name={field.label}
          helpText={field.helpText}
          placeholder={field.placeholder ?? field.label}
          title={field.label}
          value={value as string}
          onChange={handleTextChange}
          data-testid={`${fieldKey}-value`}
        />
      );
    case 'number':
      return (
        <Input
          id={changeKey}
          name={field.label}
          helpText={field.helpText}
          type="number"
          placeholder={field.placeholder ?? field.label}
          title={field.label}
          value={value as number}
          onChange={handleNumberChange}
          data-testid={`${fieldKey}-value`}
        />
      );
    case 'boolean':
      return (
        <Switch
          name={changeKey}
          value={Boolean(value) as boolean}
          onChange={handleSwitchChange}
        >
          {field.label}
        </Switch>
      );
    case 'object':
    case 'array':
      if (field.renderAsJSON) {
        return (
          <Textarea
            className="config-textarea-container"
            style={{
              height: 200,
              width: 350,
            }}
            id={changeKey}
            name={field.label}
            helpText={field.helpText}
            placeholder={field.placeholder ?? field.label}
            title={field.label}
            value={jsonValue as string}
            onChange={handleJSONChange}
            onBlur={handleJSONBlur}
            data-testid={`${fieldKey}-value`}
          />
        );
      }
      return null;
    default:
      return null;
  }
};
