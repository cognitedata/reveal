import { useEffect, useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { AppActionType, DataElement, Detection } from 'scarlet/types';
import { useAppContext } from 'scarlet/hooks';

import * as Styled from './style';

export type DataSourceProps = {
  value?: string;
  disabled?: boolean;
  dataElement: DataElement;
  detection?: Detection;
};

export const DataSource = ({
  value: originalValue,
  disabled,
  dataElement,
  detection,
}: DataSourceProps) => {
  const [value, setValue] = useState(originalValue);
  const { appDispatch } = useAppContext();

  useEffect(() => {
    if (originalValue === undefined && disabled) {
      setValue('N/A');
    }
  }, [originalValue]);

  const removeDetection = () =>
    appDispatch({
      type: AppActionType.REMOVE_DETECTION,
      dataElement,
      detection: detection!,
    });

  return (
    <>
      <Input
        value={value}
        disabled={disabled}
        title="Field value"
        variant="titleAsPlaceholder"
        fullWidth
        style={{ height: '48px' }}
        postfix={dataElement.unit}
        onChange={(e) => setValue(e.target.value)}
      />
      {!disabled && (
        <Styled.ButtonContainer>
          <Styled.Button type="primary" iconPlacement="left" icon="Checkmark">
            Approve
          </Styled.Button>
          <Styled.Button
            type="tertiary"
            iconPlacement="left"
            icon="Delete"
            onClick={removeDetection}
          >
            Remove
          </Styled.Button>
        </Styled.ButtonContainer>
      )}
    </>
  );
};
