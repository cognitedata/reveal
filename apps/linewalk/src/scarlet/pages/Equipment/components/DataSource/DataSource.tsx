import { useEffect, useState } from 'react';
import { Checkbox, Icon, Input, toast } from '@cognite/cogs.js';
import {
  AppActionType,
  DataElement,
  DataPanelActionType,
  Detection,
  DetectionState,
  DetectionType,
} from 'scarlet/types';
import {
  useAppContext,
  useDataElementConfig,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import usePrevious from 'hooks/usePrevious';

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
  const [isApproved, setIsApproved] = useState(
    detection?.state === DetectionState.APPROVED
  );
  const [isRemoving, setRemoving] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { appState, appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const dataElementConfig = useDataElementConfig(dataElement);
  const isPCMS = detection?.type === DetectionType.PCMS;
  const disabledActions = isApproving || isRemoving || isSaving;

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

  const approveDetection = (isApproved: boolean) => {
    setApproving(true);
    setIsApproved(isApproved);

    appDispatch({
      type: AppActionType.APPROVE_DETECTION,
      dataElement,
      detection: detection!,
      isApproved,
    });
  };

  const saveDetection = () => {
    setIsSaving(true);

    appDispatch({
      type: AppActionType.SAVE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
    });
  };

  useEffect(() => {
    if (!appState.saveState.loading) {
      if (isRemoving) setRemoving(false);
      else if (isApproving) setApproving(false);
      else if (isSaving) setIsSaving(false);
    }
  }, [appState]);

  useEffect(() => {
    if (detection?.state !== DetectionState.APPROVED && isApproved) {
      setIsApproved(false);
    }
  }, [detection?.state]);

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

  const prevDetectionState = usePrevious(detection?.state || 'no-state');
  useEffect(() => {
    if (
      prevDetectionState === 'no-state' &&
      detection?.state === DetectionState.APPROVED
    ) {
      toast.success(
        `"${dataElementConfig?.label || dataElement.key}" has been set to ${
          detection.value
        }${dataElementConfig?.unit}`
      );
      dataPanelDispatch({
        type: DataPanelActionType.CLOSE_DATA_ELEMENT,
      });
    }
  }, [detection?.state]);

  return (
    <>
      <Input
        id={inputId}
        value={value}
        disabled={isPCMS}
        title="Field value"
        variant="titleAsPlaceholder"
        fullWidth
        style={{ height: '48px' }}
        postfix={dataElementConfig?.unit}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onFocus}
      />
      {!isPCMS && (
        <Styled.ButtonContainer>
          <Styled.Button
            type="primary"
            iconPlacement="left"
            icon="Checkmark"
            loading={isSaving}
            disabled={
              disabledActions || value === '' || value === originalValue
            }
            onClick={saveDetection}
          >
            {originalValue === undefined ? 'Add as data source' : 'Save'}
          </Styled.Button>
          <Styled.Button
            type="tertiary"
            iconPlacement="left"
            icon={isRemoving ? 'Loader' : 'Delete'}
            disabled={disabledActions}
            onClick={removeDetection}
            aria-label="Remove data source"
          />
        </Styled.ButtonContainer>
      )}

      <Styled.Delimiter />

      <Checkbox
        name={`detection-${detection?.id}`}
        onChange={approveDetection}
        checked={isApproved}
        disabled={
          disabledActions ||
          originalValue === undefined ||
          value !== originalValue
        }
      >
        <span className="cogs-detail">Set as primary value</span>
        {isApproving && (
          <Styled.LoaderContainer>
            <Icon type="Loader" />
          </Styled.LoaderContainer>
        )}
      </Checkbox>
    </>
  );
};
