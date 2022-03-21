import { useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import {
  useAppContext,
  useDataElementConfig,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import { AppActionType, DataElement, DataPanelActionType } from 'scarlet/types';
import { getDataElementPrimaryDetection } from 'scarlet/utils';

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
  const dataElementConfig = useDataElementConfig(
    !isMultiple ? dataElements[0] : undefined
  );
  const dataPanelDispatch = useDataPanelDispatch();

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      const errorMessage = isMultiple
        ? `Failed to approve ${dataElements.length} data fields`
        : `Failed to approve data field "${dataElementConfig?.label}"`;
      toast.error(errorMessage);
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        const successMessage = isMultiple
          ? `${dataElements.length} data fields have been approved`
          : `Data field "${dataElementConfig?.label}" has been approved`;
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
        type: AppActionType.UPDATE_DETECTION,
        dataElement,
        detection,
        value: detection.value,
        isApproved: true,
        isPrimary: true,
      });
    });
  };

  const title = isMultiple ? 'Accept values?' : 'Accept value?';

  const description = isMultiple
    ? 'You can modify fields with accepted values after approving.'
    : `You can modify field "${dataElementConfig?.label}" with accepted value after approving.`;

  return (
    <Modal
      title={title}
      description={description}
      okText={loading ? 'Saving...' : 'Yes, Approve'}
      visible={visible}
      onOk={onApprove}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
    />
  );
};
