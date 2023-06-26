import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ContextMenu } from '@vision/modules/Common/Components/ContextMenu/ContextMenu';
import { ContextMenuPosition } from '@vision/modules/Common/Components/ContextMenu/types';
import { TableDataItem } from '@vision/modules/Common/types/index';
import { selectUpdatedFileDetails } from '@vision/modules/FileDetails/selectors';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { isProcessingFile } from '@vision/modules/Process/store/utils';
import { RootState } from '@vision/store/rootReducer';

import { FileInfo } from '@cognite/sdk';

export const ContextMenuContainer = ({
  rowData,
  position,
}: {
  rowData: TableDataItem;
  position: ContextMenuPosition;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuActions, rowKey, ...fileInfo } = rowData;
  const { id } = rowData;

  const handleFileDetails = () => {
    if (menuActions?.onFileDetailsClicked) {
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
    }
  };

  const handleFileDelete = () => {
    menuActions.onFileDelete(id);
  };

  const handleReview = () => {
    if (menuActions?.onReviewClick) {
      menuActions.onReviewClick(fileInfo as FileInfo);
    }
  };

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, id)
  );

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, id)
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
