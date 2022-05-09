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
  useDataElementConfig,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import { getPrettifiedDataElementValue } from 'scarlet/utils';

import { DataSourceField } from '..';

import * as Styled from './style';

export type DataSourceProps = {
  dataElement: DataElement;
  detection: Detection;
  focused?: boolean;
  isPrimaryOnApproval?: boolean;
  isDraft?: boolean;
  hasConnectedElements: boolean;
};

export type DataSourceFormValues = {
  value: string;
  externalSource?: string;
};

export const DataSource = ({
  dataElement,
  detection,
  focused,
  isPrimaryOnApproval = false,
  isDraft = false,
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
  const dataElementConfig = useDataElementConfig(dataElement);
  const isPCMS = detection?.type === DetectionType.PCMS;
  const isExternalSource = detection?.type === DetectionType.MANUAL_EXTERNAL;
  const isActionsDisabled =
    isApproving || isRemoving || isSaving || isPrimaryLoading;

  const externalSourceId = `data-field-source-${detection!.id}`;
  const inputId = `data-field-input-${detection!.id}`;

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
    if (isPrimaryOnApproval && hasConnectedElements) {
      openConnectedModal(values);
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
        isApproved: true,
        isPrimary: isPrimaryOnApproval,
        ...values,
      });
    } else {
      appDispatch({
        type: AppActionType.UPDATE_DETECTION,
        dataElement,
        detection: detection!,
        isApproved: true,
        isPrimary: isPrimaryOnApproval,
        ...values,
      });
    }
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
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      isApproved: true,
      isPrimary,
      ...values,
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
      type: AppActionType.UPDATE_DETECTION,
      dataElement,
      detection: detection!,
      isApproved: true,
      isPrimary,
      ...values,
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
          {isExternalSource && (
            <Styled.ExternalSourceContainer>
              <DataSourceField name="externalSource" label="Source" />
            </Styled.ExternalSourceContainer>
          )}

          <DataSourceField
            id={inputId}
            name="value"
            label={isPCMS ? 'PCMS value' : 'Field value'}
            type={dataElementConfig!.type}
            unit={dataElementConfig!.unit}
            values={dataElementConfig!.values}
            disabled={isPCMS}
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
                  disabled={isActionsDisabled || !isValid || !dirty}
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
                  disabled={isActionsDisabled || !isValid}
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
                onChange={(isPrimary: boolean) =>
                  updatePrimaryValue(values, isPrimary)
                }
                checked={isPrimary}
                disabled={
                  (!isPCMS && dirty) ||
                  isActionsDisabled ||
                  (!isPCMS && detection?.state !== DetectionState.APPROVED)
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
                  dirty ||
                  isActionsDisabled ||
                  (!isPCMS && detection?.state !== DetectionState.APPROVED)
                }
              />
            )}
          </Styled.PrimaryValueContainer>

          <DataSourceSavingHelper
            dataElementKey={dataElement.key}
            values={values}
            label={dataElementConfig?.label}
            unit={dataElementConfig?.unit}
            type={dataElementConfig?.type}
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
            }" has been set to "${getPrettifiedDataElementValue(
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
