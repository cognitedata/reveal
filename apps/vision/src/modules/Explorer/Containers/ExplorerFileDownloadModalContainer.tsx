import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { FileDownloaderModal } from '../../Common/Components/FileDownloaderModal/FileDownloaderModal';
import { setFileDownloadModalVisibility } from '../../Common/store/common/slice';
import { selectExplorerSelectedFileIdsInSortedOrder } from '../store/selectors';

export const ExplorerFileDownloadModalContainer = () => {
  const dispatch = useThunkDispatch();

  const showFileDownloadModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showFileDownloadModal
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIdsInSortedOrder(state)
  );

  return (
    <FileDownloaderModal
      fileIds={selectedFileIds}
      showModal={showFileDownloadModal}
      onCancel={() => dispatch(setFileDownloadModalVisibility(false))}
    />
  );
};
