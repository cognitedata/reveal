import { useEffect, useState } from 'react';
import { Input } from '@cognite/cogs.js';
import {
  AppActionType,
  DataElement,
  DataPanelActionType,
  Detection,
} from 'scarlet/types';
import {
  useAppContext,
  useDataPanelDispatch,
  useUpdateEquipmentPCMS,
} from 'scarlet/hooks';

import * as Styled from './style';

export type DataSourceProps = {
  id: string;
  value?: string;
  disabled?: boolean;
  dataElement: DataElement;
  detection?: Detection;
  focused?: boolean;
};

export const DataSource = ({
  id,
  value: originalValue,
  disabled,
  dataElement,
  detection,
  focused,
}: DataSourceProps) => {
  const [value, setValue] = useState(originalValue ?? '');
  const [isRemoving, setRemoving] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const { appState, appDispatch } = useAppContext();
  const updatePCMS = useUpdateEquipmentPCMS(dataElement.key);
  const dataPanelDispatch = useDataPanelDispatch();
  const inputId = `data-source-${id}`;

  useEffect(() => {
    if (originalValue === undefined && disabled) {
      setValue('N/A');
    } else {
      setValue(originalValue ?? '');
    }
  }, [originalValue]);

  const removeDetection = () => {
    setRemoving(true);
    appDispatch({
      type: AppActionType.REMOVE_DETECTION,
      dataElement,
      detection: detection!,
    });
  };

  const approveDetection = async () => {
    setApproving(true);

    await updatePCMS(value!);

    appDispatch({
      type: AppActionType.APPROVE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
    });
  };

  useEffect(() => {
    if (!appState.saveState.loading) {
      if (isRemoving) setRemoving(false);
      else if (isApproving) setApproving(false);
    }
  }, [appState]);

  const onFocus = () => {
    if (detection) {
      dataPanelDispatch({
        type: DataPanelActionType.SET_ACTIVE_DETECTION,
        detection,
      });
    }
  };

  useEffect(() => {
    if (focused) {
      document.getElementById(inputId)?.focus();
    }
  }, [focused]);

  return (
    <>
      <Input
        id={inputId}
        value={value}
        disabled={disabled}
        title="Field value"
        variant="titleAsPlaceholder"
        fullWidth
        style={{ height: '48px' }}
        postfix={dataElement.unit}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onFocus}
      />
      {!disabled && (
        <Styled.ButtonContainer>
          <Styled.Button
            type="primary"
            iconPlacement="left"
            icon="Checkmark"
            loading={isApproving}
            disabled={isRemoving || !value}
            onClick={approveDetection}
          >
            Approve
          </Styled.Button>
          <Styled.Button
            type="tertiary"
            iconPlacement="left"
            icon="Delete"
            loading={isRemoving}
            disabled={isApproving}
            onClick={removeDetection}
          >
            Remove
          </Styled.Button>
        </Styled.ButtonContainer>
      )}
    </>
  );
};
