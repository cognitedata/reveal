import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMenu } from 'src/modules/Common/Components/ActionMenu/ActionMenu';
import { ReviewButton } from 'src/modules/Common/Components/ReviewButton/ReviewButton';
import { selectAllSelectedIds } from 'src/modules/Common/store/files/selectors';
import { RootState } from 'src/store/rootReducer';
import { CellRenderer, TableDataItem } from 'src/modules/Common/types';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import styled from 'styled-components';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { selectExplorerSelectedIds } from 'src/modules/Explorer/store/explorerSlice';
import { FileInfo } from '@cognite/sdk';

export function ActionRenderer(
  rowData: TableDataItem,
  mode: VisionMode,
  actionDisabled: boolean
) {
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
    dispatch(DeleteFilesById([id]));
  };

  const handleReview = () => {
    if (menuActions?.onReviewClick) {
      menuActions.onReviewClick(fileInfo as FileInfo);
    }
  };

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
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
