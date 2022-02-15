import { FileDownloaderModal } from 'src/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFileDownloadModalVisibility } from 'src/modules/Common/store/common/slice';
import { RootState } from 'src/store/rootReducer';
import { selectProcessSelectedFileIdsInSortedOrder } from 'src/modules/Process/store/selectors';

export const ProcessFileDownloadModalContainer = () => {
  const dispatch = useDispatch();

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
