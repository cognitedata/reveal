import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { ContextMenuPosition } from 'src/modules/Common/Components/ContextMenu/types';
import { TableDataItem } from 'src/modules/Common/types/index';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { isProcessingFile } from 'src/modules/Process/store/utils';
import { RootState } from 'src/store/rootReducer';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/selectors';

import { makeSelectJobStatusForFile } from 'src/modules/Process/store/selectors';
import { ContextMenu } from 'src/modules/Common/Components/ContextMenu/ContextMenu';

export const ContextMenuContainer = ({
  rowData,
  position,
}: {
  rowData: TableDataItem;
  position: ContextMenuPosition;
}) => {
  const dispatch = useDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuActions, rowKey, ...fileInfo } = rowData;

  const handleFileDetails = () => {
    if (menuActions?.onFileDetailsClicked) {
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
    }
  };

  const handleFileDelete = () => {
    const { id } = rowData;
    dispatch(DeleteFilesById({ fileIds: [id] }));
  };

  const handleReview = () => {
    if (menuActions?.onReviewClick) {
      menuActions.onReviewClick(fileInfo as FileInfo);
    }
  };

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, rowData.id)
  );

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, rowData.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  return (
    <ContextMenu
      position={position}
      showExifIcon={fileDetails?.geoLocation !== undefined}
      reviewDisabled={reviewDisabled}
      handleReview={handleReview}
      handleFileDelete={handleFileDelete}
      handleFileDetails={handleFileDetails}
    />
  );
};
