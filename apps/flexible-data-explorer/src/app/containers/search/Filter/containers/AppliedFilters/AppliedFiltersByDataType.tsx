import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import unset from 'lodash/unset';

import { ValueByDataType, ValueByField } from '../../types';

import { AppliedFiltersByField } from './AppliedFiltersByField';

export interface AppliedFiltersByDataTypeProps {
  value?: ValueByDataType;
  onRemove?: (value: ValueByDataType) => void;
}

export const AppliedFiltersByDataType: React.FC<
  AppliedFiltersByDataTypeProps
> = ({ value = {}, onRemove }) => {
  const handleRemove = (dataType: string, valueByField: ValueByField) => {
    const newValue = { ...value };

    if (isEmpty(valueByField)) {
      unset(newValue, dataType);
    } else {
      newValue[dataType] = valueByField;
    }

    onRemove?.(newValue);
  };

  return (
    <>
      {Object.entries(value).map(([dataType, valueByField]) => {
        return (
          <AppliedFiltersByField
            key={dataType}
            dataType={dataType}
            value={valueByField}
            onRemove={(newValueByField) =>
              handleRemove(dataType, newValueByField)
            }
          />
        );
      })}
    </>
  );
};
