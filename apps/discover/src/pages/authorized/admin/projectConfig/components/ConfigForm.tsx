import * as React from 'react';

import { ConfigFormFields } from '../fields';
import { ConfigFormProps } from '../types';

import { ConfigComponent } from './ConfigComponent';

type Props = ConfigFormProps & {
  hasDataAsChildren?: boolean;
};

export const ConfigForm: React.FC<Props> = ({
  metadataPath,
  metadataValue,
  values,
  valuePath,
  onChange,
  onChangeAndUpdate,
  onUpdate,
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
          values={values}
          onChange={onChange}
          onChangeAndUpdate={onChangeAndUpdate}
          onUpdate={onUpdate}
          valuePath={valuePath}
          metadataPath={metadataPath}
          hasChanges={hasChanges}
        />
      ) : (
        <ConfigFormFields
          metadataValue={metadataValue}
          values={values}
          valuePath={valuePath}
          onChange={onChange}
          shouldDisable
        />
      )}
    </>
  );
};
