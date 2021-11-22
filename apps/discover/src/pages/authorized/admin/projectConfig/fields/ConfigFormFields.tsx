import React from 'react';

import get from 'lodash/get';
import map from 'lodash/map';

import { HandleConfigChange, MetadataValue } from '../types';

import { ConfigInputField } from './ConfigInputField';

export const ConfigFormFields: React.FC<{
  metadataValue?: MetadataValue;
  valuePath?: string;
  onChange: HandleConfigChange;
  onReset?: () => void;
  value: unknown;
}> = ({ metadataValue, valuePath, value, onChange, onReset }) => {
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
            field={child}
            changeKey={valuePath ? `${valuePath}.${childKey}` : childKey}
            onChange={onChange}
            onReset={onReset}
          />
        );
      })}
    </>
  );
};
