import React from 'react';

import { ConfigFormFields } from '../fields';
import { ConfigFormProps } from '../types';

import { ConfigComponent } from './ConfigComponent';

type Props = ConfigFormProps & {
  hasDataAsChildren?: boolean;
};

export const ConfigForm: React.FC<Props> = ({
  metadataPath,
  metadataValue,
  value,
  valuePath,
  onChange,
  onDelete,
  hasDataAsChildren,
  renderCustomComponent,
  renderDeleteComponent,
  hasChanges,
}) => {
  return (
    <>
      {hasDataAsChildren ? (
        <ConfigComponent
          renderCustomComponent={renderCustomComponent}
          renderDeleteComponent={renderDeleteComponent}
          metadataValue={metadataValue}
          value={value}
          onChange={onChange}
          valuePath={valuePath}
          metadataPath={metadataPath}
          hasChanges={hasChanges}
          onDelete={onDelete}
        />
      ) : (
        <ConfigFormFields
          metadataValue={metadataValue}
          value={value}
          valuePath={valuePath}
          onChange={onChange}
        />
      )}
    </>
  );
};
