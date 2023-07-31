import { useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import { useAppContext, useDataPanelDispatch } from 'hooks';
import {
  AppActionType,
  DataElement,
  DataElementState,
  DataPanelActionType,
} from 'types';

import { Modal } from '../..';

type ApproveModalProps = {
  visible: boolean;
  dataElements?: DataElement[];
  onClose: () => void;
};

export const RestoreModal = ({
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
        ? `Failed to restore ${dataElements.length} data fields`
        : `Failed to restore data field "${dataElements?.[0].config.label}"`;

      toast.error(errorMessage);
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);

      if (!appState.saveState.error) {
        const successMessage = isMultiple
          ? `${dataElements.length} data fields have been restored`
          : `Data field "${dataElements?.[0].config.label}" has been restored`;

        toast.success(successMessage);

        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });

        onClose();
      }
    }
  }, [appState.saveState]);

  const onRestore = () => {
    if (!dataElements.length) return;

    setLoading(true);

    appDispatch({
      type: AppActionType.UPDATE_DATA_ELEMENTS_STATE,
      dataElements,
      state: DataElementState.PENDING,
      stateReason: undefined,
    });
  };

  const title = isMultiple ? 'Restore fields?' : 'Restore field?';

  const description = isMultiple
    ? 'Selected fields will be restored to pending states.'
    : `Data field "${dataElements?.[0].config.label}" will be restored to pending state.`;

  return (
    <Modal
      title={title}
      description={description}
      okText={loading ? 'Saving...' : 'Yes, Restore'}
      visible={visible}
      onOk={onRestore}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
      isPrompt
    />
  );
};
