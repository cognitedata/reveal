import { useAppContext } from 'scarlet/hooks';
import { AppActionType, DataElementState } from 'scarlet/types';

import { ApproveModal } from './ApproveModal';
import { OmitModal } from './OmitModal';

export const DataElementModals = () => {
  const { appState, appDispatch } = useAppContext();
  const onCloseDataElementModal = () =>
    appDispatch({
      type: AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL,
    });

  return (
    <>
      <ApproveModal
        dataElement={appState.dataElementModal?.dataElement}
        visible={appState.dataElementModal?.state === DataElementState.APPROVED}
        onClose={onCloseDataElementModal}
      />
      <OmitModal
        dataElement={appState.dataElementModal?.dataElement}
        visible={appState.dataElementModal?.state === DataElementState.OMITTED}
        onClose={onCloseDataElementModal}
      />
    </>
  );
};
