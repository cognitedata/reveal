import React from 'react';
import { useSelector } from 'react-redux';

import { FileDownloaderModal } from '@vision/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import { setFileDownloadModalVisibility } from '@vision/modules/Common/store/common/slice';
import { selectProcessSelectedFileIdsInSortedOrder } from '@vision/modules/Process/store/selectors';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';

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
