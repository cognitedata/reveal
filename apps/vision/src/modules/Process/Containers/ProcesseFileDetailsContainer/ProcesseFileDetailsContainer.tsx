import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { getParamLink, workflowRoutes } from '../../../../utils/workflowRoutes';
import { zIndex } from '../../../../utils/zIndex';
import { FileDetails } from '../../../FileDetails/Containers/FileDetails';
import { hideFileMetadata } from '../../store/slice';

export const ProcessFileDetailsContainer = () => {
  const dispatch = useThunkDispatch();
  const navigate = useNavigate();
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );
  const showFileDetails = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadata
  );

  const onClose = () => {
    dispatch(hideFileMetadata());
  };

  const onFileDetailReview = () => {
    if (fileId) {
      navigate(getParamLink(workflowRoutes.review, ':fileId', String(fileId)));
    }
  };
  if (showFileDetails && fileId) {
    return (
      <Container>
        <FileDetails
          fileId={fileId}
          onClose={onClose}
          onReview={onFileDetailReview}
        />
      </Container>
    );
  }
  return null;
};

const Container = styled.div`
  width: 400px;
  border-left: 1px solid #d9d9d9;
  box-sizing: content-box;
  flex-shrink: 0;
  height: 100%;
  z-index: ${zIndex.SIDE_PANEL};
`;
