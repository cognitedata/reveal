import { FileDownloaderModal } from 'src/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { setFileDownloadModalVisibility } from 'src/modules/Common/store/common/slice';
import { selectExplorerSelectedFileIdsInSortedOrder } from 'src/modules/Explorer/store/selectors';

export const ExplorerFileDownloadModalContainer = () => {
  const dispatch = useDispatch();

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
