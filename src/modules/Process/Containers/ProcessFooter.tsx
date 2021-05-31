import React, { useState } from 'react';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectIsPollingComplete,
  selectIsProcessingStarted,
} from 'src/modules/Process/processSlice';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { getContainer } from 'src/utils';
import SummaryStep from 'src/modules/Process/Containers/SummaryStep';
import { selectAllFiles } from 'src/modules/Common/filesSlice';

export const ProcessFooter = () => {
  const history = useHistory();
  const [isModalOpen, setModalOpen] = useState(false);
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const isProcessingStarted = useSelector((state: RootState) => {
    return selectIsProcessingStarted(state.processSlice);
  });

  const allFilesStatus = useSelector(
    (state: RootState) => state.filesSlice.allFilesStatus
  );

  const processFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const onCancel = () => {
    setModalOpen(false);
  };

  const onNextClicked = () => {
    pushMetric('Vision.Session.Finished');
    history.push(createLink('/vision/explore'));
  };

  const onUploadMoreClicked = () => {
    pushMetric('Vision.Session.Finished');
    history.push(getLink(workflowRoutes.upload));
  };

  const handleSkipClick = () => {
    Modal.confirm({
      title: 'Just so you know',
      content:
        'By skipping processing you will be taken back to the home page. Your files are uploaded to Cognite Data Fusion and can be processed later.',
      onOk: () => {
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
          >
            Finish session
          </Button>
        ) : null}
        {showSkip ? (
          <Button
            onClick={handleSkipClick}
            disabled={!isPollingFinished || !allFilesStatus}
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
