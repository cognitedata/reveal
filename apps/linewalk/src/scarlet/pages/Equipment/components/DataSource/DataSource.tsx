import { FormEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Icon, Input, toast } from '@cognite/cogs.js';
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
  disabled?: boolean;
  dataElement: DataElement;
  detection: Detection;
  focused?: boolean;
  isPrimaryOnApproval?: boolean;
  isDraft?: boolean;
  hasConnectedElements: boolean;
};

export const DataSource = ({
  disabled,
  dataElement,
  detection,
  focused,
  isPrimaryOnApproval = false,
  isDraft = false,
  hasConnectedElements,
}: DataSourceProps) => {
  const originalValue = detection.value;
  const originalExternalSource = detection.externalSource;
  const [value, setValue] = useState(originalValue ?? '');
  const [externalSource, setExternalSource] = useState(
    originalExternalSource ?? ''
  );
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
  const isExternalSource = detection?.type === DetectionType.MANUAL_EXTERNAL;
  const isActionsDisabled =
    isApproving || isRemoving || isSaving || isPrimaryLoading;

  const externalSourceId = `data-field-source-${detection!.id}`;
  const inputId = `data-field-input-${detection!.id}`;

  useEffect(() => {
    if (originalValue === undefined && disabled) {
      setValue('N/A');
    } else {
      setValue(originalValue ?? '');
    }
  }, [originalValue]);

  const removeDetection = () => {
    if (isDraft) {
      dataPanelDispatch({
        type: DataPanelActionType.REMOVE_NEW_DETECTION,
      });
    } else {
      setRemoving(true);
      appDispatch({
        type: AppActionType.REMOVE_DETECTION,
        dataElement,
        detection: detection!,
      });
    }
  };

  const approveDetection = (e: FormEvent) => {
    e.preventDefault();

    if (isPrimaryOnApproval && hasConnectedElements) {
      openConnectedModal();
      return;
    }

    setApproving(true);
    setIsApproved(isApproved);

    if (isPrimaryOnApproval) {
      setIsPrimaryLoading(true);
      setIsPrimary(true);
    }

    if (isDraft) {
      appDispatch({
        type: AppActionType.ADD_DETECTION,
        dataElement,
        detection: detection!,
        value: value || '',
        externalSource,
        isApproved: true,
        isPrimary: isPrimaryOnApproval,
      });
    } else {
      appDispatch({
        type: AppActionType.UPDATE_DETECTION,
        dataElement,
        detection: detection!,
        value: value || '',
        externalSource,
        isApproved: true,
        isPrimary: isPrimaryOnApproval,
      });
    }
  };

  const updatePrimaryValue = (isPrimary: boolean) => {
    if (isPrimary && hasConnectedElements) {
      openConnectedModal();
      return;
    }

    setIsPrimary(isPrimary);
    setIsPrimaryLoading(true);
    setIsApproved(isApproved);

    appDispatch({
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
      externalSource,
      isApproved: true,
      isPrimary,
    });
  };

  const saveDetection = (e: FormEvent) => {
    e.preventDefault();
    if (isPrimary && hasConnectedElements) {
      openConnectedModal();
      return;
    }
    setIsSaving(true);

    appDispatch({
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      value: value || '',
      externalSource,
      isApproved: true,
      isPrimary,
    });
  };

  const openConnectedModal = () => {
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_CONNECTED_ELEMENTS_MODAL,
      dataElement,
      detection: { ...detection, value, externalSource },
    });
  };

  useEffect(() => {
    if (!appState.saveState.loading) {
      if (isRemoving) setRemoving(false);
      if (isApproving && !isDraft) setApproving(false);
      if (isSaving) setIsSaving(false);
      if (isPrimaryLoading) {
        setIsPrimaryLoading(false);
        if (!appState.saveState.error && isPrimary) {
          toast.success(
            `"${
              dataElementConfig?.label || dataElement.key
            }" has been set to "${value.trim()}${
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

  useEffect(() => {
    if (isApproving && !isDraft) setApproving(false);
  }, [isDraft]);

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
      const focusId = isExternalSource && isDraft ? externalSourceId : inputId;
      document.getElementById(focusId)?.focus();
    }
  }, [focused]);

  const isFormPristine =
    value === originalValue &&
    (!isExternalSource || externalSource === originalExternalSource);

  const isFormValid =
    value.trim() !== '' && (!isExternalSource || externalSource.trim() !== '');

  const isPrimaryValueDisabled =
    (!isPCMS && detection?.state !== DetectionState.APPROVED) ||
    !isFormPristine ||
    isActionsDisabled;

  return (
    <form
      onSubmit={
        detection?.state === DetectionState.APPROVED
          ? saveDetection
          : approveDetection
      }
    >
      {isExternalSource && (
        <Styled.ExternalSourceContainer>
          <Input
            id={externalSourceId}
            value={externalSource}
            disabled={isPCMS}
            title="Source"
            variant="titleAsPlaceholder"
            fullWidth
            style={{ height: '48px' }}
            postfix={dataElementConfig?.unit}
            onChange={(e) => setExternalSource(e.target.value)}
          />
        </Styled.ExternalSourceContainer>
      )}
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
              disabled={isActionsDisabled || !isFormValid || isFormPristine}
              onClick={saveDetection}
            >
              Save
            </Styled.Button>
          ) : (
            <Styled.Button
              type="primary"
              htmlType="submit"
              iconPlacement="left"
              icon="Checkmark"
              loading={isApproving}
              disabled={isActionsDisabled || !isFormValid}
              onClick={approveDetection}
            >
              {isDraft ? 'Approve' : 'Add as data source'}
            </Styled.Button>
          )}
          <Styled.Button
            type="tertiary"
            htmlType="button"
            iconPlacement="left"
            icon={isRemoving ? 'Loader' : 'Delete'}
            disabled={isActionsDisabled}
            onClick={removeDetection}
            aria-label="Remove data source"
          />
        </Styled.ButtonContainer>
      )}

      <Styled.Delimiter />

      <Styled.PrimaryValueContainer>
        <div>
          <Styled.PrimaryValueLabel className="cogs-detail">
            Set as primary value
          </Styled.PrimaryValueLabel>
          <Checkbox
            name={`detection-${detection?.id}`}
            onChange={updatePrimaryValue}
            checked={isPrimary}
            disabled={isPrimaryValueDisabled}
          >
            <span className="cogs-detail">For this field</span>
            {isPrimaryLoading && (
              <Styled.LoaderContainer>
                <Icon type="Loader" />
              </Styled.LoaderContainer>
            )}
          </Checkbox>
        </div>

        {hasConnectedElements && (
          <Button
            type="tertiary"
            icon="Edit"
            onClick={openConnectedModal}
            aria-label="Open connected data-elements"
            disabled={isPrimaryValueDisabled}
          />
        )}
      </Styled.PrimaryValueContainer>
    </form>
  );
};
