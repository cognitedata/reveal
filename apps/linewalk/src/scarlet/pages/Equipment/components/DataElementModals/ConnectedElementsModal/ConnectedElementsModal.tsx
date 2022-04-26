import { useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import {
  useAppContext,
  useConnectedDataElements,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataPanelActionType,
  Detection,
} from 'scarlet/types';

import { ConnectedElements, Modal } from '../..';

type ConnectedElementsModalProps = {
  visible: boolean;
  dataElement: DataElement;
  detection: Detection;
  onClose: () => void;
};

export const ConnectedElementsModal = ({
  visible,
  dataElement,
  detection,
  onClose,
}: ConnectedElementsModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const [loading, setLoading] = useState(false);
  const connectedElements = useConnectedDataElements(dataElement.key);
  const [selectedDataElementIds, setSelectedDataElementIds] = useState<
    string[]
  >([]);
  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      toast.error('Failed to connect data fields');
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        toast.success(
          `${selectedDataElementIds.length} data fields have been approved`
        );

        onClose();

        dataPanelDispatch({
          type: DataPanelActionType.CLOSE_DATA_ELEMENT,
        });

        dataPanelDispatch({
          type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS,
        });
      }
    }
  }, [appState.saveState]);

  const onApprove = () => {
    setLoading(true);

    appDispatch({
      type: AppActionType.SET_CONNECTED_DATA_ELEMENTS,
      dataElements: connectedElements.filter((dataElement) =>
        selectedDataElementIds.includes(dataElement.id)
      ),
      currentDataElementId: dataElement.id,
      detection,
      isApproved: true,
      isPrimary: true,
    });
  };

  const onChange = (values: string[]) => {
    setSelectedDataElementIds((currentSelected) =>
      values.length !== selectedDataElementIds.length ? values : currentSelected
    );
  };
  return (
    <Modal
      title="Set primary value for multiple instances of a field"
      okText={loading ? 'Saving...' : 'Save'}
      visible={visible}
      onOk={onApprove}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
    >
      <ConnectedElements
        dataElement={dataElement}
        detection={detection}
        connectedElements={connectedElements}
        onChange={onChange}
      />
    </Modal>
  );
};
