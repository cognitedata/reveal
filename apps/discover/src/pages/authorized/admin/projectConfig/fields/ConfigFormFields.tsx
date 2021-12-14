import React from 'react';

import get from 'lodash/get';
import map from 'lodash/map';

import { HandleConfigChange, MetadataValue } from '../types';

import { ConfigInputField } from './ConfigInputField';

export const ConfigFormFields: React.FC<{
  metadataValue?: MetadataValue;
  valuePath?: string;
  onChange: HandleConfigChange;
  value: unknown;
  error?: Record<string, string | boolean>;
}> = ({ metadataValue, valuePath, value, onChange, error }) => {
  return (
    <>
      {map(metadataValue?.children, (child, childKey) => {
        if (child.children) {
          return null;
        }
        return (
          <ConfigInputField
            key={`${valuePath}${childKey}`}
            value={get(value, childKey)}
            error={get(error, childKey)}
            field={child}
            changeKey={valuePath ? `${valuePath}.${childKey}` : childKey}
            onChange={onChange}
          />
        );
      })}
    </>
  );
};
