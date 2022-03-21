import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useAppContext } from 'scarlet/hooks';
import { AppActionType, DataElement, DataElementState } from 'scarlet/types';

import { ApproveModal } from './ApproveModal';
import { OmitModal } from './OmitModal';
import { RestoreModal } from './RestoreModal';

export const DataElementModals = () => {
  const { appState, appDispatch } = useAppContext();
  const [dataElementModal, setDataElementModal] =
    useState<{ dataElements: DataElement[]; state: DataElementState }>();
  const [isVisible, setIsVisible] = useState(false);

  const onCloseDataElementModal = () => {
    setIsVisible(false);
    appDispatch({
      type: AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL,
    });
  };

  // it's here for animation to be completed
  const removeModal = useCallback(
    debounce(() => setDataElementModal(undefined), 300),
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

  switch (dataElementModal?.state) {
    case DataElementState.APPROVED:
      return (
        <ApproveModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onCloseDataElementModal}
        />
      );
    case DataElementState.OMITTED:
      return (
        <OmitModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onCloseDataElementModal}
        />
      );
    case DataElementState.PENDING:
      return (
        <RestoreModal
          dataElements={dataElementModal.dataElements}
          visible={isVisible}
          onClose={onCloseDataElementModal}
        />
      );
  }

  return null;
};
