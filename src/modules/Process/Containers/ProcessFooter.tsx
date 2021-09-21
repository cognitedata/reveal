/* eslint-disable @cognite/no-number-z-index */
import React, { useState } from 'react';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectAllProcessFiles,
  selectIsPollingComplete,
  selectIsProcessingStarted,
  setProcessViewFileUploadModalVisibility,
} from 'src/modules/Process/processSlice';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { getContainer } from 'src/utils';
import SummaryStep from 'src/modules/Process/Containers/SummaryStep';
import { AppDispatch } from 'src/store';

export const ProcessFooter = () => {
  const history = useHistory();
  const dispatch: AppDispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const isProcessingStarted = useSelector((state: RootState) => {
    return selectIsProcessingStarted(state.processSlice);
  });

  const processFiles = useSelector((state: RootState) =>
    selectAllProcessFiles(state)
  );

  const onCancel = () => {
    setModalOpen(false);
  };

  const clearOnFinishProcessing = () => {
    dispatch(PopulateProcessFiles([]));
  };

  const onNextClicked = () => {
    clearOnFinishProcessing();
    pushMetric('Vision.Session.Finished');
    history.push(createLink('/vision/explore'));
  };

  const onUploadMoreClicked = () => {
    pushMetric('Vision.Session.UploadMore');
    setModalOpen(false);
    dispatch(setProcessViewFileUploadModalVisibility(true));
  };

  const handleSkipClick = () => {
    Modal.confirm({
      title: 'Just so you know',
      content:
        'By skipping processing you will be taken back to the home page. Your files are uploaded to Cognite Data Fusion and can be processed later.',
      onOk: () => {
        clearOnFinishProcessing();
        history.push(createLink('/vision/explore'));
      },
    });
  };

  const showComplete =
    !processFiles.length || (processFiles.length && isProcessingStarted);
  const showSkip = processFiles.length && !isProcessingStarted;

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
            <Button onClick={() => setModalOpen(false)} disabled={false}>
              Continue processing files
            </Button>
            <div style={{ padding: '10px' }} />
            <Button onClick={onNextClicked} disabled={false} type="primary">
              Finish Session
            </Button>
          </FooterContainer>
        }
        visible={isModalOpen}
        width={800}
        closable={false}
        onCancel={onCancel}
      >
        <SummaryStep />
      </Modal>
      <FooterContainer>
        {showComplete ? (
          <Button
            onClick={() => setModalOpen(true)}
            disabled={!processFiles.length || !isPollingFinished}
            style={{ zIndex: 1 }}
          >
            Finish session
          </Button>
        ) : null}
        {showSkip ? (
          <Button
            onClick={handleSkipClick}
            disabled={!isPollingFinished}
            style={{ zIndex: 1 }}
          >
            Finish session without processing
          </Button>
        ) : null}
      </FooterContainer>
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
