import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/store/processSlice';
import { annotationsById } from 'src/store/previewSlice';
import Modal from 'react-modal';
import { Modal as CogsModal } from '@cognite/cogs.js';
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

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setModalOpen(false);
  }

  // Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
  Modal.setAppElement('#cdf-vision-subapp');

  const disableComplete =
    !isPollingFinished || !Object.keys(annotations).length;
  const [modalOpen, setModalOpen] = useState(false);
  // CogsModal isn't working
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
          disabled: false, // disableComplete,
          title: '',
        }}
        skipBtnProps={{
          disabled:
            !isPollingFinished ||
            !allFilesStatus ||
            !!Object.keys(annotations).length,
        }}
      />
      <Modal
        isOpen={modalOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <SummaryStep />
      </Modal>
      <CogsModal
        visible={modalOpen}
        title="My modal"
        onOk={() => setModalOpen(false)}
        appElement={document.getElementById('#cdf-vision-subapp') || undefined}
      >
        <h1>Modal Content</h1>
      </CogsModal>
    </>
  );
};
