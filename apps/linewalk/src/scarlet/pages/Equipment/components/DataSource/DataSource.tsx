import { useEffect, useState } from 'react';
import { Button, Checkbox, Icon, toast } from '@cognite/cogs.js';
import { Form, Formik, FormikState } from 'formik';
import {
  AppActionType,
  DataElement,
  DataElementType,
  DataElementUnit,
  DataPanelActionType,
  Detection,
  DetectionState,
  DetectionType,
} from 'scarlet/types';
import {
  useAppContext,
  useAppState,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import { getPrintedDataElementValue } from 'scarlet/utils';

import { DataSourceField, DataSourceOrigin } from '..';

import * as Styled from './style';

export type DataSourceProps = {
  dataElement: DataElement;
  detection: Detection;
  focused?: boolean;
  isDraft?: boolean;
  isCalculated?: boolean;
  hasConnectedElements: boolean;
};

export type DataSourceFormValues = {
  value: string;
  externalSource?: string;
};

const readOnlyDetectionTypes = [
  DetectionType.PCMS,
  DetectionType.MAL,
  DetectionType.MS2,
  DetectionType.MS3,
  DetectionType.LINKED,
  DetectionType.CALCULATED,
];

export const DataSource = ({
  dataElement,
  detection,
  focused,
  isDraft = false,
  isCalculated = false,
  hasConnectedElements,
}: DataSourceProps) => {
  const originalValue = detection.value;
  const originalExternalSource = detection.externalSource;
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
  const { appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const isPCMS = detection?.type === DetectionType.PCMS;
  const isExternalSource = detection?.type === DetectionType.MANUAL_EXTERNAL;
  const isActionsDisabled =
    isApproving || isRemoving || isSaving || isPrimaryLoading;

  const externalSourceId = `data-field-source-${detection!.id}`;
  const inputId = `data-field-input-${detection!.id}`;
  const isReadOnly = readOnlyDetectionTypes.includes(detection.type);
  const isLinkedSource = detection.type === DetectionType.LINKED;

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

  const approveDetection = (values: DataSourceFormValues) => {
    if (hasConnectedElements) {
      openConnectedModal(values);
      return;
    }

    setApproving(true);
    setIsApproved(isApproved);

    setIsPrimaryLoading(true);
    setIsPrimary(true);

    appDispatch({
      type: AppActionType.REPLACE_DETECTION,
      dataElement,
      detection: {
        ...detection!,
        ...values,
        state: DetectionState.APPROVED,
        isPrimary: true,
      },
    });
  };

  const updatePrimaryValue = (
    values: DataSourceFormValues,
    isPrimary: boolean
  ) => {
    if (isPrimary && hasConnectedElements) {
      openConnectedModal(values);
      return;
    }

    setIsPrimary(isPrimary);
    setIsPrimaryLoading(true);
    setIsApproved(isApproved);

    appDispatch({
      type: AppActionType.REPLACE_DETECTION,
      dataElement,
      detection: {
        ...detection!,
        ...values,
        state: DetectionState.APPROVED,
        isPrimary,
      },
    });
  };

  const saveDetection = (values: DataSourceFormValues) => {
    if (isPrimary && hasConnectedElements) {
      openConnectedModal(values);
      return;
    }
    setIsSaving(true);
    if (isPrimary) setIsPrimaryLoading(true);

    appDispatch({
      type: AppActionType.REPLACE_DETECTION,
      dataElement,
      detection: {
        ...detection!,
        ...values,
        state: DetectionState.APPROVED,
        isPrimary,
      },
    });
  };

  const openConnectedModal = (values: DataSourceFormValues) => {
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_CONNECTED_ELEMENTS_MODAL,
      dataElement,
      detection: { ...detection, ...values },
    });
  };

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
    if (detection?.boundingBox) {
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

  return (
    <Formik<DataSourceFormValues>
      initialValues={{
        value: originalValue ?? '',
        externalSource: isExternalSource
          ? originalExternalSource ?? ''
          : undefined,
      }}
      onSubmit={
        detection?.state === DetectionState.APPROVED
          ? saveDetection
          : approveDetection
      }
    >
      {({ values, isValid, dirty, setSubmitting, resetForm }) => (
        <Form onFocus={onFocus}>
          {isLinkedSource && (
            <Styled.LinkedSourceContainer>
              <DataSourceOrigin detection={detection} />
            </Styled.LinkedSourceContainer>
          )}

          {isExternalSource && (
            <Styled.ExternalSourceContainer>
              <DataSourceField name="externalSource" label="Source" />
            </Styled.ExternalSourceContainer>
          )}

          <DataSourceField
            id={inputId}
            name="value"
            label={isPCMS ? 'PCMS value' : 'Field value'}
            type={dataElement.config.type}
            unit={dataElement.config.unit}
            values={dataElement.config.values}
            disabled={isReadOnly}
          />

          {!isReadOnly && (
            <Styled.ButtonContainer>
              {detection?.state === DetectionState.APPROVED && (
                <Styled.Button
                  type="primary"
                  htmlType="submit"
                  iconPlacement="left"
                  icon="Checkmark"
                  loading={isSaving}
                  disabled={
                    !isSaving && (isActionsDisabled || !isValid || !dirty)
                  }
                >
                  {dirty ? 'Save' : 'Approved'}
                </Styled.Button>
              )}
              {detection?.state !== DetectionState.APPROVED && (
                <Styled.Button
                  type="primary"
                  htmlType="submit"
                  iconPlacement="left"
                  icon="Checkmark"
                  loading={isApproving}
                  disabled={!isApproving && (isActionsDisabled || !isValid)}
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

          {!isDraft &&
            !isCalculated &&
            !isLinkedSource &&
            detection.state === DetectionState.APPROVED && (
              <>
                <Styled.Delimiter />
                <Styled.PrimaryValueContainer>
                  <div>
                    <Styled.PrimaryValueLabel className="cogs-detail">
                      Set as primary value
                    </Styled.PrimaryValueLabel>
                    <Checkbox
                      name={`detection-${detection?.id}`}
                      onChange={(isPrimary: boolean) =>
                        updatePrimaryValue(values, isPrimary)
                      }
                      checked={isPrimary}
                      disabled={
                        (!isReadOnly && dirty) ||
                        isActionsDisabled ||
                        (!isReadOnly &&
                          detection?.state !== DetectionState.APPROVED)
                      }
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
                      htmlType="button"
                      icon="Edit"
                      onClick={() => openConnectedModal(values)}
                      aria-label="Open connected data-elements"
                      disabled={
                        (!isReadOnly && dirty) ||
                        isActionsDisabled ||
                        (!isReadOnly &&
                          detection?.state !== DetectionState.APPROVED)
                      }
                    />
                  )}
                </Styled.PrimaryValueContainer>
              </>
            )}

          {isLinkedSource && (
            <>
              <Styled.Delimiter />
              <Styled.PrimaryValueContainer>
                <div>
                  <Styled.PrimaryValueLabel className="cogs-detail">
                    Set as primary value
                  </Styled.PrimaryValueLabel>
                  <Checkbox
                    name={`detection-${detection?.id}`}
                    checked
                    disabled
                  >
                    <span className="cogs-detail">For this field</span>
                  </Checkbox>
                </div>

                <Styled.Button
                  type="tertiary"
                  htmlType="button"
                  iconPlacement="left"
                  icon={isRemoving ? 'Loader' : 'Delete'}
                  disabled={isActionsDisabled}
                  onClick={removeDetection}
                  aria-label="Remove data source"
                />
              </Styled.PrimaryValueContainer>
            </>
          )}

          <DataSourceSavingHelper
            dataElementKey={dataElement.key}
            values={values}
            label={dataElement.config.label}
            unit={dataElement.config.unit}
            type={dataElement.config.type}
            isDraft={isDraft}
            isRemoving={isRemoving}
            isApproving={isApproving}
            isSaving={isSaving}
            isPrimaryLoading={isPrimaryLoading}
            isPrimary={isPrimary}
            setRemoving={setRemoving}
            setApproving={setApproving}
            setIsSaving={setIsSaving}
            setIsPrimaryLoading={setIsPrimaryLoading}
            setSubmitting={setSubmitting}
            resetForm={resetForm}
          />
        </Form>
      )}
    </Formik>
  );
};

interface DataSourceSavingHelperProps {
  dataElementKey: string;
  values: DataSourceFormValues;
  label?: string;
  unit?: DataElementUnit;
  type?: DataElementType;
  isDraft: boolean;
  isRemoving: boolean;
  isApproving: boolean;
  isSaving: boolean;
  isPrimaryLoading: boolean;
  isPrimary: boolean;
  setRemoving: (value: boolean) => void;
  setApproving: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setIsPrimaryLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  resetForm: (nextState?: Partial<FormikState<DataSourceFormValues>>) => void;
}

const DataSourceSavingHelper = ({
  dataElementKey,
  values,
  label,
  unit,
  type,
  isDraft,
  isRemoving,
  isApproving,
  isSaving,
  isPrimaryLoading,
  isPrimary,
  setRemoving,
  setApproving,
  setIsSaving,
  setIsPrimaryLoading,
  setSubmitting,
  resetForm,
}: DataSourceSavingHelperProps) => {
  const appState = useAppState();
  const dataPanelDispatch = useDataPanelDispatch();

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
              label || dataElementKey
            }" has been set to "${getPrintedDataElementValue(
              values.value,
              unit,
              type
            )}"`
          );
          dataPanelDispatch({
            type: DataPanelActionType.CLOSE_DATA_ELEMENT,
          });
        }
      }

      if (isRemoving || isApproving || isSaving || isPrimaryLoading) {
        setSubmitting(false);

        if (!appState.saveState.error) {
          resetForm({ values });
        }
      }
    }
  }, [appState.saveState]);

  return null;
};
