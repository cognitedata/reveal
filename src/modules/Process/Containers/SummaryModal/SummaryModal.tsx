/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setProcessViewFileUploadModalVisibility,
  setSummaryModalVisibility,
} from 'src/modules/Process/store/slice';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { getContainer } from 'src/utils';
import SummaryContent from 'src/modules/Process/Containers/SummaryModal/SummaryContent';
import { AppDispatch } from 'src/store';
import { RootState } from 'src/store/rootReducer';

export const SummaryModal = () => {
  const history = useHistory();
  const dispatch: AppDispatch = useDispatch();

  const showSummaryModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showSummaryModal
  );

  const onCancel = () => {
    dispatch(setSummaryModalVisibility(false));
  };

  const clearOnFinishProcessing = () => {
    dispatch(setSummaryModalVisibility(false));
    dispatch(PopulateProcessFiles([]));
  };

  const onNextClicked = () => {
    clearOnFinishProcessing();
    pushMetric('Vision.Session.Finished');
    history.push(createLink('/vision/explore'));
  };

  const onUploadMoreClicked = () => {
    pushMetric('Vision.Session.UploadMore');
    dispatch(setSummaryModalVisibility(false));
    dispatch(setProcessViewFileUploadModalVisibility(true));
  };

  return (
    <>
      <Modal
        getContainer={getContainer}
        footer={
          <FooterContainer>
            <Button onClick={onUploadMoreClicked} disabled={false}>
              Upload More
            </Button>
            <div style={{ flexGrow: 1 }} />
            <Button
              onClick={() => dispatch(setSummaryModalVisibility(false))}
              disabled={false}
            >
              Continue processing files
            </Button>
            <div style={{ padding: '10px' }} />
            <Button onClick={onNextClicked} disabled={false} type="primary">
              Finish Session
            </Button>
          </FooterContainer>
        }
        visible={showSummaryModal}
        width={800}
        closable={false}
        onCancel={onCancel}
      >
        <SummaryContent />
      </Modal>
    </>
  );
};

const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 50px;
  padding: 0 20px;
`;
