import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { CellRenderer, FileActions } from 'src/modules/Common/types';
import styled from 'styled-components';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { ReviewButton } from '../../Components/ReviewButton/ReviewButton';
import { ActionMenu } from '../../Components/ActionMenu/ActionMenu';

export function ActionRenderer(
  menu: FileActions,
  id: number,
  mode: VisionMode
) {
  const dispatch = useDispatch();

  const handleMetadataEdit = () => {
    if (menu?.showMetadataPreview) {
      menu.showMetadataPreview(id);
    }
  };

  const handleFileDelete = () => {
    dispatch(DeleteAnnotationsByFileIds([id]));
    dispatch(deleteFilesById([{ id }]));
  };

  const handleReview = () => {
    if (menu?.onReviewClick) {
      menu.onReviewClick(id);
    }
  };

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, id)
  );
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, id)
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
        handleMetadataEdit={handleMetadataEdit}
      />
    </Action>
  );
}

export function ActionRendererExplorer({
  rowData: { menu, id },
}: CellRenderer) {
  return ActionRenderer(menu, id, VisionMode.Explore);
}

export function ActionRendererProcess({ rowData: { menu, id } }: CellRenderer) {
  return ActionRenderer(menu, id, VisionMode.Contextualize);
}

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;
