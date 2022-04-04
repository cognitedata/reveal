import { useEffect, useState } from 'react';
import { toast, Textarea } from '@cognite/cogs.js';
import {
  useAppContext,
  useDataElementConfig,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataElementState,
  DataPanelActionType,
} from 'scarlet/types';

import { Modal } from '../..';

type OmitModalProps = {
  visible: boolean;
  dataElements?: DataElement[];
  onClose: () => void;
};

export const OmitModal = ({
  visible,
  dataElements = [],
  onClose: propsOnClose,
}: OmitModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const [reason, setReason] = useState('');
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
        ? `Failed to ignore ${dataElements.length} data fields`
        : `Failed to ignore data field "${dataElementConfig?.label}"`;

      toast.error(errorMessage);
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        const successMessage = isMultiple
          ? `${dataElements.length} data fields have been ignored`
          : `Data field "${dataElementConfig?.label}" has been ignored`;

        toast.success(successMessage);

        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });

        onClose();
      }
    }
  }, [appState.saveState]);

  const onOmit = () => {
    if (!dataElements.length) return;

    setLoading(true);

    appDispatch({
      type: AppActionType.UPDATE_DATA_ELEMENTS_STATE,
      dataElements,
      state: DataElementState.OMITTED,
      stateReason: reason,
    });
  };

  const onClose = () => {
    setReason('');
    propsOnClose();
  };

  const title = isMultiple ? 'Ignore fields?' : 'Ignore field?';

  const description = isMultiple
    ? 'Ignored fields would be omitted from data export.'
    : `Ignored field "${dataElementConfig?.label}" would be omitted from data export.`;

  return (
    <Modal
      title={title}
      description={description}
      okText={loading ? 'Saving...' : 'Yes, Ignore'}
      visible={visible}
      onOk={onOmit}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
      isPrompt
    >
      <Textarea
        value={reason}
        resize={false}
        rows={5}
        placeholder="Leave comment here"
        onChange={(e) => {
          setReason(e.target.value);
        }}
      />
    </Modal>
  );
};
