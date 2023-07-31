import { useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import { useAppContext, useDataPanelDispatch } from 'hooks';
import {
  AppActionType,
  DataElement,
  DataPanelActionType,
  DetectionState,
} from 'types';
import { getDataElementPrimaryDetection } from 'utils';

import { Modal } from '../..';

type ApproveModalProps = {
  visible: boolean;
  dataElements?: DataElement[];
  onClose: () => void;
};

export const ApproveModal = ({
  visible,
  dataElements = [],
  onClose,
}: ApproveModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const isMultiple = dataElements.length > 1;
  const dataPanelDispatch = useDataPanelDispatch();

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      const errorMessage = isMultiple
        ? `Failed to approve ${dataElements.length} data fields`
        : `Failed to approve data field "${dataElements[0].config.label}"`;
      toast.error(errorMessage);
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        const successMessage = isMultiple
          ? `${dataElements.length} data fields have been approved`
          : `Data field "${dataElements[0].config.label}" has been approved`;
        toast.success(successMessage);

        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });

        onClose();
      }
    }
  }, [appState.saveState]);

  const onApprove = () => {
    if (!dataElements.length) return;

    setLoading(true);

    dataElements.forEach((dataElement) => {
      const detection = getDataElementPrimaryDetection(dataElement!);
      if (!detection || detection.value === undefined) return;

      appDispatch({
        type: AppActionType.REPLACE_DETECTION,
        dataElement,
        detection: {
          ...detection,
          state: DetectionState.APPROVED,
          isPrimary: true,
        },
      });
    });
  };

  const title = isMultiple ? 'Accept values?' : 'Accept value?';

  const description = isMultiple
    ? 'You can modify fields with accepted values after approving.'
    : `You can modify field "${dataElements?.[0].config.label}" with accepted value after approving.`;

  return (
    <Modal
      title={title}
      description={description}
      okText={loading ? 'Saving...' : 'Yes, Approve'}
      visible={visible}
      onOk={onApprove}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
      isPrompt
    />
  );
};
