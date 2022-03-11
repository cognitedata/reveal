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

import * as Styled from './style';

export type DataSourceProps = {
  id: string;
  value?: string;
  disabled?: boolean;
  dataElement: DataElement;
  detection?: Detection;
  focused?: boolean;
  isPrimaryOnApproval?: boolean;
};

export const DataSource = ({
  id,
  value: originalValue,
  disabled,
  dataElement,
  detection,
  focused,
  isPrimaryOnApproval = false,
}: DataSourceProps) => {
  const [value, setValue] = useState(originalValue ?? '');
  const [isApproved, setIsApproved] = useState(
    detection?.state === DetectionState.APPROVED
  );
  const [isPrimary, setIsPrimary] = useState(
    detection?.state === DetectionState.APPROVED
  );
  const [isRemoving, setRemoving] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [isPrimaryLoading, setIsPrimaryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { appState, appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const dataElementConfig = useDataElementConfig(dataElement);
  const isPCMS = detection?.type === DetectionType.PCMS;
  const disabledActions =
    isApproving || isRemoving || isSaving || isPrimaryLoading;

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

  const approveDetection = () => {
    setApproving(true);
    setIsApproved(isApproved);

    if (isPrimaryOnApproval) {
      setIsPrimaryLoading(true);
      setIsPrimary(true);
    }

    appDispatch({
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
      isApproved: true,
      isPrimary: isPrimaryOnApproval,
    });
  };

  const updatePrimaryValue = (isPrimary: boolean) => {
    setIsPrimary(true);
    setIsPrimaryLoading(true);
    setIsApproved(isApproved);

    appDispatch({
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
      isApproved: true,
      isPrimary,
    });
  };

  const saveDetection = () => {
    setIsSaving(true);

    appDispatch({
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
      isApproved: true,
      isPrimary: false,
    });
  };

  useEffect(() => {
    if (!appState.saveState.loading) {
      if (isRemoving) setRemoving(false);
      if (isApproving) setApproving(false);
      if (isSaving) setIsSaving(false);
      if (isPrimaryLoading) {
        setIsPrimaryLoading(false);
        if (!appState.saveState.error) {
          toast.success(
            `"${
              dataElementConfig?.label || dataElement.key
            }" has been set to "${value}${
              dataElementConfig?.unit ? ` ${dataElementConfig.unit}` : ''
            }"`
          );
          dataPanelDispatch({
            type: DataPanelActionType.CLOSE_DATA_ELEMENT,
          });
        }
      }
    }
  }, [appState]);

  useEffect(() => {
    if (detection?.state !== DetectionState.APPROVED && isApproved) {
      setIsApproved(false);
    }
    if (!detection?.isPrimary && isPrimary) {
      setIsPrimary(false);
    }
  }, [detection]);

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
    <form
      onSubmit={
        detection?.state === DetectionState.APPROVED
          ? saveDetection
          : approveDetection
      }
    >
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
          {detection?.state === DetectionState.APPROVED ? (
            <Styled.Button
              type="primary"
              htmlType="submit"
              iconPlacement="left"
              icon="Checkmark"
              loading={isSaving}
              disabled={
                disabledActions || value === '' || value === originalValue
              }
              onClick={saveDetection}
            >
              {detection?.state !== DetectionState.APPROVED
                ? 'Add as data source'
                : 'Save'}
            </Styled.Button>
          ) : (
            <Styled.Button
              type="primary"
              htmlType="submit"
              iconPlacement="left"
              icon="Checkmark"
              loading={isApproving}
              disabled={disabledActions || value === ''}
              onClick={approveDetection}
            >
              Add as data source
            </Styled.Button>
          )}
          <Styled.Button
            type="tertiary"
            htmlType="button"
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
        onChange={updatePrimaryValue}
        checked={isPrimary}
        disabled={
          (!isPCMS && detection?.state !== DetectionState.APPROVED) ||
          value !== originalValue ||
          disabledActions
        }
      >
        <span className="cogs-detail">Set as primary value</span>
        {isPrimaryLoading && (
          <Styled.LoaderContainer>
            <Icon type="Loader" />
          </Styled.LoaderContainer>
        )}
      </Checkbox>
    </form>
  );
};
