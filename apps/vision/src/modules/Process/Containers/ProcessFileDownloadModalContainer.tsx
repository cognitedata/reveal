import React from 'react';
import { useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { FileDownloaderModal } from '../../Common/Components/FileDownloaderModal/FileDownloaderModal';
import { setFileDownloadModalVisibility } from '../../Common/store/common/slice';
import { selectProcessSelectedFileIdsInSortedOrder } from '../store/selectors';

export const ProcessFileDownloadModalContainer = () => {
  const dispatch = useThunkDispatch();

  const showFileDownloadModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showFileDownloadModal
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectProcessSelectedFileIdsInSortedOrder(state)
  );

  return (
    <FileDownloaderModal
      fileIds={selectedFileIds}
      showModal={showFileDownloadModal}
      onCancel={() => dispatch(setFileDownloadModalVisibility(false))}
    />
  );
};
