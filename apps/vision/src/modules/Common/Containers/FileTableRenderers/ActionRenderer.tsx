import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { VisionMode } from '@vision/constants/enums/VisionEnums';
import { ActionMenu } from '@vision/modules/Common/Components/ActionMenu/ActionMenu';
import { ReviewButton } from '@vision/modules/Common/Components/ReviewButton/ReviewButton';
import { selectAllSelectedIds } from '@vision/modules/Common/store/files/selectors';
import { CellRenderer, TableDataItem } from '@vision/modules/Common/types';
import { selectExplorerSelectedIds } from '@vision/modules/Explorer/store/selectors';
import { selectUpdatedFileDetails } from '@vision/modules/FileDetails/selectors';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { isProcessingFile } from '@vision/modules/Process/store/utils';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { DeleteFilesById } from '@vision/store/thunks/Files/DeleteFilesById';

import { FileInfo } from '@cognite/sdk';

export function ActionRenderer(
  rowData: TableDataItem,
  mode: VisionMode,
  actionDisabled: boolean
) {
  const dispatch = useThunkDispatch();
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

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, rowData.id)
  );
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, rowData.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  const showReviewButton = mode === VisionMode.Contextualize;

  return (
    <Action>
      {showReviewButton && (
        <ReviewButton
          disabled={reviewDisabled}
          onClick={handleReview}
          noBackground
        />
      )}
      <ActionMenu
        showExifIcon={fileDetails?.geoLocation !== undefined}
        actionDisabled={actionDisabled}
        reviewDisabled={reviewDisabled}
        handleReview={showReviewButton ? undefined : handleReview} // skip menu item if button is shown
        handleFileDelete={handleFileDelete}
        handleFileDetails={handleFileDetails}
      />
    </Action>
  );
}

export function ActionRendererExplorer({ rowData }: CellRenderer) {
  const filesSelected = useSelector(
    (state: RootState) =>
      !!selectExplorerSelectedIds(state.explorerReducer).length
  );
  return ActionRenderer(rowData, VisionMode.Explore, filesSelected);
}

export function ActionRendererProcess({ rowData }: CellRenderer) {
  const filesSelected = useSelector(
    (state: RootState) => !!selectAllSelectedIds(state.fileReducer).length
  );
  return ActionRenderer(rowData, VisionMode.Contextualize, filesSelected);
}

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
`;
