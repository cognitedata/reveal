import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/store/processSlice';
import { annotationsById } from 'src/store/previewSlice';
import { Modal } from '@cognite/cogs.js';
import AntStyles from 'src/styles/AntStyles';
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
      // top: '50%',
      // left: '50%',
      // right: 'auto',
      // bottom: 'auto',
      transform: 'translate(100%, 100%)',
    },
  };

  const onCancel = () => {
    console.log('cancel');
    setModalOpen(false);
  };
  // Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
  // const disableComplete =
  //   !isPollingFinished || !Object.keys(annotations).length;
  const [isModalOpen, setModalOpen] = useState(false);
  // CogsModal isn't working
  return (
    <>
      <AntStyles>
        <Modal
          footer={() => <></>}
          visible={isModalOpen}
          width={800}
          closable={false}
          onCancel={onCancel}
          style={customStyles.content}
        >
          <SummaryStep />
        </Modal>
      </AntStyles>
      <PrevNextNav
        prevBtnProps={{
          onClick: () => history.push(getLink(workflowRoutes.upload)),
          disabled: !isPollingFinished,
        }}
        nextBtnProps={{
          onClick: () => setModalOpen(true),
          children: 'Finish processing',
          disabled: false, // disableComplete, #DEBUGGING PURPOSES
          title: '',
        }}
        skipBtnProps={{
          disabled:
            !isPollingFinished ||
            !allFilesStatus ||
            !!Object.keys(annotations).length,
        }}
      />
    </>
  );
};
