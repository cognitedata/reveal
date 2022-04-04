import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useAppContext, useDataPanelContext } from 'scarlet/hooks';
import {
  AppActionType,
  AppStateDataElementModal,
  DataElementState,
  DataPanelActionType,
  DataPanelStateConnectedElementsModal,
} from 'scarlet/types';

import { ApproveModal } from './ApproveModal';
import { OmitModal } from './OmitModal';
import { RestoreModal } from './RestoreModal';
import { ConnectedElementsModal } from './ConnectedElementsModal';

export const DataElementModals = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { appState, appDispatch } = useAppContext();
  const { dataPanelState, dataPanelDispatch } = useDataPanelContext();
  const [dataElementModal, setDataElementModal] =
    useState<AppStateDataElementModal>();
  const [connectedElementsModal, setConnectedElementsModal] =
    useState<DataPanelStateConnectedElementsModal>();

  const onClose = () => {
    setIsVisible(false);
    if (dataElementModal) {
      appDispatch({
        type: AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL,
      });
    } else {
      dataPanelDispatch({
        type: DataPanelActionType.CLOSE_CONNECTED_ELEMENTS_MODAL,
      });
    }
  };

  // it's here for animation to be completed
  const removeModal = useCallback(
    debounce(() => setDataElementModal(undefined), 300),
    []
  );

  const removeConnectedElementsModal = useCallback(
    debounce(() => setConnectedElementsModal(undefined), 300),
    []
  );

  useEffect(() => {
    if (appState.dataElementModal) {
      setIsVisible(true);
      setDataElementModal(appState.dataElementModal);
    } else {
      removeModal();
    }
  }, [appState.dataElementModal?.dataElements]);

  useEffect(() => {
    if (dataPanelState.connectedElementsModal) {
      setIsVisible(true);
      setConnectedElementsModal(dataPanelState.connectedElementsModal);
    } else {
      removeConnectedElementsModal();
    }
  }, [dataPanelState.connectedElementsModal]);

  if (connectedElementsModal) {
    return (
      <ConnectedElementsModal
        dataElement={connectedElementsModal.dataElement}
        detection={connectedElementsModal.detection}
        visible={isVisible}
        onClose={onClose}
      />
    );
  }

  switch (dataElementModal?.state) {
    case DataElementState.APPROVED:
      return (
        <ApproveModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onClose}
        />
      );
    case DataElementState.OMITTED:
      return (
        <OmitModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onClose}
        />
      );
    case DataElementState.PENDING:
      return (
        <RestoreModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onClose}
        />
      );
  }

  return null;
};
