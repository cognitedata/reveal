import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FileDownloaderModal } from '@vision/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import { setFileDownloadModalVisibility } from '@vision/modules/Common/store/common/slice';
import { selectExplorerSelectedFileIdsInSortedOrder } from '@vision/modules/Explorer/store/selectors';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';

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
