import { useEffect, useMemo, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import { useAppContext, useDataPanelDispatch } from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataPanelActionType,
  Detection,
} from 'scarlet/types';
import {
  getConnectedDataElements,
  getDataElementPrimaryDetection,
} from 'scarlet/utils';

import { Modal } from '../..';

import { MultiConnectedElementsStep } from './MultiConnectedElementsStep';

type MultiConnectedElementsModalProps = {
  visible: boolean;
  dataElements: DataElement[];
  onClose: () => void;
};

type Step = {
  dataElement: DataElement;
  connectedElements: DataElement[];
  detection: Detection;
};

export const MultiConnectedElementsModal = ({
  visible,
  dataElements,
  onClose,
}: MultiConnectedElementsModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const [loading, setLoading] = useState(false);
  const [totalSavingAmount, setTotalSavingAmount] = useState(0);
  const [stepIndex, setStepIndex] = useState<number>();
  const [stepSelectedIds, setStepSelectedIds] = useState<
    Record<number, string[]>
  >({});
  const equipment = appState.equipment.data!;

  const { steps, unconnectedDataElements } = useMemo(() => {
    const steps: Step[] = [];
    const unconnectedDataElements: DataElement[] = [];
    const ignoreDataElementIds = dataElements.map((item) => item.id);

    dataElements.forEach((dataElement) => {
      if (steps.some((step) => step.dataElement.key === dataElement.key)) {
        unconnectedDataElements.push(dataElement);
        return;
      }

      const connectedElements = getConnectedDataElements(
        equipment,
        dataElement.key,
        ignoreDataElementIds
      );

      if (!connectedElements.length) {
        unconnectedDataElements.push(dataElement);
      } else {
        steps.push({
          dataElement,
          connectedElements: [dataElement, ...connectedElements],
          detection: getDataElementPrimaryDetection(dataElement)!,
        });
      }
    });

    return { steps, unconnectedDataElements };
  }, [dataElements]);

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      toast.error(`Failed to approve ${totalSavingAmount} data fields`);
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        toast.success(`${totalSavingAmount} data fields have been approved`);

        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });

        onClose();
      }
    }
  }, [appState.saveState]);

  const onChange = (ids: string[]) => {
    setStepSelectedIds((result) =>
      result[stepIndex!]?.length !== ids.length
        ? { ...result, [stepIndex!]: ids }
        : result
    );
  };

  const isPrompt = stepIndex === undefined;

  const title = isPrompt
    ? 'Review multiple instances?'
    : 'Set primary value for multiple instances of a field';

  let okText = isPrompt ? 'Review fields' : 'Next';
  const description = isPrompt
    ? 'You selected some fields with multiple instances, you can assign the same primary value to these instances.'
    : undefined;

  const onContinue = () =>
    setStepIndex((stepIndex) => (stepIndex !== undefined ? stepIndex + 1 : 0));
  const onPrevious = () =>
    setStepIndex((stepIndex) => (stepIndex ? stepIndex - 1 : stepIndex));

  const onSave = () => {
    setLoading(true);
    let totalSavingAmount = 0;

    unconnectedDataElements.forEach((dataElement) => {
      const detection = getDataElementPrimaryDetection(dataElement!);
      if (!detection || detection.value === undefined) return;

      appDispatch({
        type: AppActionType.UPDATE_DETECTION,
        dataElement,
        detection,
        value: detection.value,
        isApproved: true,
        isPrimary: true,
      });
    });

    totalSavingAmount += unconnectedDataElements.length;

    steps.forEach((step, stepIndex) => {
      const dataElements = step.connectedElements.filter((dataElement) =>
        stepSelectedIds[stepIndex]?.includes(dataElement.id)
      );

      appDispatch({
        type: AppActionType.SET_CONNECTED_DATA_ELEMENTS,
        dataElements,
        currentDataElementId: step.dataElement.id,
        detection: step.detection,
        isApproved: true,
        isPrimary: true,
      });

      totalSavingAmount += dataElements.length;
    });

    setTotalSavingAmount(totalSavingAmount);
  };

  let onOk = onContinue;

  if (stepIndex === steps.length - 1) {
    onOk = onSave;
    okText = 'Approve';
  }

  if (loading) {
    okText = 'Saving...';
  }

  return (
    <Modal
      title={title}
      okText={okText}
      visible={visible}
      onOk={onOk}
      onCancel={!loading ? onClose : () => null}
      secondaryButton={
        !isPrompt
          ? {
              label: 'Previous',
              onClick: onPrevious,
              disabled: stepIndex === 0 || loading,
            }
          : undefined
      }
      isPrompt={isPrompt}
      description={description}
      loading={loading}
    >
      {stepIndex !== undefined && (
        <MultiConnectedElementsStep
          stepInfo={
            steps.length > 1 ? `${stepIndex + 1} of ${steps.length}` : undefined
          }
          {...steps[stepIndex]}
          onChange={onChange}
        />
      )}
    </Modal>
  );
};
