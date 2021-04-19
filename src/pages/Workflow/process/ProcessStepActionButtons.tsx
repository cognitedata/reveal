import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/store/processSlice';
import { annotationsById } from 'src/store/previewSlice';
import { Modal } from '@cognite/cogs.js';
import SummaryStep from '../summary/SummaryStep';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const { allFilesStatus } = useSelector(
    (state: RootState) => state.uploadedFiles
  );

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });

  const disableComplete =
    !isPollingFinished || !Object.keys(annotations).length;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PrevNextNav
        prevBtnProps={{
          onClick: () => history.push(getLink(workflowRoutes.upload)),
          disabled: !isPollingFinished,
        }}
        nextBtnProps={{
          onClick: () => setModalOpen(true),
          children: 'Finish processing',
          disabled: disableComplete,
          title: '',
        }}
        skipBtnProps={{
          disabled:
            !isPollingFinished ||
            !allFilesStatus ||
            !!Object.keys(annotations).length,
        }}
      />
      <div style={{ background: 'white' }}>
        <Modal
          footer={<></>}
          visible={modalOpen}
          title="My modal with a custom footer"
          onOk={() => setModalOpen(false)}
        >
          <SummaryStep />
        </Modal>
      </div>
    </>
  );
};
