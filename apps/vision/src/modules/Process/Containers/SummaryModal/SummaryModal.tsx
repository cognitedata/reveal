import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Modal } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { PopulateProcessFiles } from '../../../../store/thunks/Process/PopulateProcessFiles';
import { getContainer } from '../../../../utils';
import { pushMetric } from '../../../../utils/pushMetric';
import {
  setProcessViewFileUploadModalVisibility,
  setSummaryModalVisibility,
} from '../../store/slice';

import SummaryContent from './SummaryContent';

export const SummaryModal = () => {
  const navigate = useNavigate();
  const dispatch = useThunkDispatch();

  const showSummaryModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showSummaryModal
  );

  const onCancel = () => {
    dispatch(setSummaryModalVisibility(false));
  };

  const clearOnFinishProcessing = async () => {
    dispatch(setSummaryModalVisibility(false));
    await dispatch(PopulateProcessFiles([])); // wait until state clears unless warning will be shown
  };

  const onNextClicked = async () => {
    await clearOnFinishProcessing();
    pushMetric('Vision.Session.Finished');
    navigate(createLink('/vision/explore'));
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
        open={showSummaryModal}
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
