import * as React from 'react';

import get from 'lodash/get';
import map from 'lodash/map';

import { HandleConfigChange, MetadataValue } from '../types';

import { ConfigInputField } from './ConfigInputField';

export const ConfigFormFields: React.FC<{
  metadataValue?: MetadataValue;
  valuePath?: string;
  onChange: HandleConfigChange;
  values: unknown;
  error?: Record<string, string | undefined>;
  shouldDisable?: boolean;
}> = ({ metadataValue, valuePath, values, onChange, error, shouldDisable }) => {
  return (
    <>
      {map(metadataValue?.children, (child, childKey) => {
        if (child.children || child.hidden) {
          return null;
        }
        return (
          <ConfigInputField
            key={`${valuePath}${childKey}`}
            value={get(values, childKey)}
            error={get(error, childKey)}
            field={child}
            changeKey={valuePath ? `${valuePath}.${childKey}` : childKey}
            onChange={onChange}
            shouldDisable={shouldDisable}
          />
        );
      })}
    </>
  );
};
