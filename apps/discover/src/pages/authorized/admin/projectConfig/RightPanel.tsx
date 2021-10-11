import React, { ChangeEvent } from 'react';

import get from 'lodash/get';
import map from 'lodash/map';

import { Input, Switch, Flex } from '@cognite/cogs.js';

import {
  MetadataKey,
  MetadataValue,
  HandleMetadataChange,
  Config,
} from './types';

interface Props {
  metadataConfig?: MetadataValue;
  onChange: HandleMetadataChange;
  valuePath: string;
  value?: Config[keyof Config];
}

const InputField: React.FC<{
  field: MetadataValue;
  fieldKey: MetadataKey;
  prefix: string;
  onChange: HandleMetadataChange;
  value?: unknown;
}> = ({ field, onChange, prefix, fieldKey, value }) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(
      `${prefix}.${fieldKey}`,
      field.type === 'number' ? Number(event.target.value) : event.target.value
    );
  };

  const handleSwitchChange = (switchValue: boolean) => {
    onChange(`${prefix}.${fieldKey}`, switchValue);
  };

  switch (field.type) {
    case 'string':
      return (
        <Input
          id={`${prefix}.${fieldKey}`}
          name={field.label}
          placeholder={field.label}
          title={field.label}
          value={value as string}
          onChange={handleInputChange}
          data-testid={`${fieldKey}-value`}
        />
      );
    case 'number':
      return (
        <Input
          id={`${prefix}.${fieldKey}`}
          name={field.label}
          type="number"
          placeholder={field.label}
          title={field.label}
          value={value as number}
          onChange={handleInputChange}
          data-testid={`${fieldKey}-value`}
        />
      );
    case 'boolean':
      return (
        <Switch
          name={`${prefix}.${fieldKey}`}
          value={Boolean(value) as boolean}
          onChange={handleSwitchChange}
        >
          {field.label}
        </Switch>
      );
    case 'object':
    case 'array':
    default:
      return null;
  }
};

export const RightPanel = (props: Props) => {
  return (
    <Flex direction="column" gap={16}>
      {props.metadataConfig?.label}
      {props.metadataConfig?.children &&
        map(props.metadataConfig.children, (child, childKey) => {
          if (child.children) {
            return null;
          }
          return (
            <InputField
              key={`${props.valuePath}${childKey}`}
              value={get(props.value, childKey)}
              field={child}
              fieldKey={childKey}
              prefix={props.valuePath}
              onChange={props.onChange}
            />
          );
        })}
    </Flex>
  );
};
