import { FileDownloaderModal } from 'src/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFileDownloadModalVisibility } from 'src/modules/Common/store/commonSlice';
import { selectAllSelectedFiles } from 'src/modules/Common/store/filesSlice';
import { RootState } from 'src/store/rootReducer';

export const ProcessFileDownloadModalContainer = () => {
  const dispatch = useDispatch();

  const showFileDownloadModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showFileDownloadModal
  );

  const selectedFiles = useSelector((state: RootState) =>
    selectAllSelectedFiles(state.filesSlice)
  );

  return (
    <FileDownloaderModal
      fileIds={selectedFiles.map((file) => file.id)}
      showModal={showFileDownloadModal}
      onCancel={() => dispatch(setFileDownloadModalVisibility(false))}
    />
  );
};
