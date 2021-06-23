import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { CellRenderer, TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { ReviewButton } from '../../Components/ReviewButton/ReviewButton';
import { ActionMenu } from '../../Components/ActionMenu/ActionMenu';

export function ActionRenderer(rowData: TableDataItem, mode: VisionMode) {
  const dispatch = useDispatch();
  const { menuActions, ...fileInfo } = rowData;

  const handleFileDetails = () => {
    if (menuActions?.onFileDetailsClicked) {
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
    }
  };

  const handleFileDelete = () => {
    const { id } = rowData;
    dispatch(DeleteAnnotationsByFileIds([id]));
    dispatch(deleteFilesById([{ id }]));
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
          style={{ marginRight: '10px' }}
        />
      )}
      <ActionMenu
        showExifIcon={fileDetails?.geoLocation !== undefined}
        disabled={reviewDisabled}
        handleReview={showReviewButton ? undefined : handleReview} // skip menu item if button is shown
        handleFileDelete={handleFileDelete}
        handleFileDetails={handleFileDetails}
      />
    </Action>
  );
}

export function ActionRendererExplorer({ rowData }: CellRenderer) {
  return ActionRenderer(rowData, VisionMode.Explore);
}

export function ActionRendererProcess({ rowData }: CellRenderer) {
  return ActionRenderer(rowData, VisionMode.Contextualize);
}

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;
