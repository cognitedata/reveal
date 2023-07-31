import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useAppContext, useDataPanelContext } from 'hooks';
import {
  AppActionType,
  AppStateDataElementModal,
  DataElement,
  DataElementState,
  DataPanelActionType,
  DataPanelStateConnectedElementsModal,
  EquipmentData,
} from 'types';
import {
  getConnectedDataElements,
  getDataElementPrimaryDetection,
} from 'utils';

import { ApproveModal } from './ApproveModal';
import { OmitModal } from './OmitModal';
import { RestoreModal } from './RestoreModal';
import { ConnectedElementsModal } from './ConnectedElementsModal';
import { MultiConnectedElementsModal } from './MultiConnectedElementsModal';

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
    case DataElementState.APPROVED: {
      return getApprovedModal(
        appState.equipment.data!,
        dataElementModal.dataElements,
        isVisible,
        onClose
      );
    }
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

const getApprovedModal = (
  equipment: EquipmentData,
  dataElements: DataElement[],
  isVisible: boolean,
  onClose: () => void
) => {
  const ignoreDataElementIds = dataElements.map((item) => item.id);
  const hasConnectedElements = dataElements.some(
    (dataElement) =>
      getConnectedDataElements(equipment, dataElement, ignoreDataElementIds)
        .length
  );

  if (!hasConnectedElements) {
    return (
      <ApproveModal
        dataElements={dataElements}
        visible={isVisible}
        onClose={onClose}
      />
    );
  }

  if (dataElements.length === 1) {
    const dataElement = dataElements[0];
    const detection = getDataElementPrimaryDetection(dataElement)!;
    return (
      <ConnectedElementsModal
        dataElement={dataElement}
        detection={detection}
        visible={isVisible}
        onClose={onClose}
      />
    );
  }

  return (
    <MultiConnectedElementsModal
      dataElements={dataElements}
      visible={isVisible}
      onClose={onClose}
    />
  );
};
