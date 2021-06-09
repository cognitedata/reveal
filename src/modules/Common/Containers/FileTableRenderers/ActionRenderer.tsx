import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { CellRenderer } from 'src/modules/Common/types';
import styled from 'styled-components';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { ReviewButton } from '../../Components/ReviewButton/ReviewButton';
import { ActionMenu } from '../../Components/ActionMenu/ActionMenu';

export function ActionRenderer({ rowData: { menu, id } }: CellRenderer) {
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

  return (
    <Action>
      <ReviewButton
        disabled={reviewDisabled}
        onClick={handleReview}
        style={{ marginRight: '10px' }}
      />
      <ActionMenu
        showExifIcon={fileDetails?.geoLocation !== undefined}
        disabled={reviewDisabled}
        handleReview={handleReview}
        handleFileDelete={handleFileDelete}
        handleMetadataEdit={handleMetadataEdit}
      />
    </Action>
  );
}

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;
