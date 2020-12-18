import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite, Board } from 'store/suites/types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import { MultiStepModalFooter } from 'components/modals/elements';
import { TS_FIX_ME } from 'types/core';
import { modalClose } from 'store/modals/actions';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { BoardForm, SuiteForm } from './steps';
import Modal from '../simpleModal/Modal';
import { ModalContainer } from '../elements';

type Step = 'suite' | 'boards';

interface Props {
  suite: Suite;
  board: Board;
  setSuite: TS_FIX_ME;
  setBoard: TS_FIX_ME;
  modalSettings: TS_FIX_ME;
}

export const MultiStepModal: React.FC<Props> = ({
  suite,
  board,
  setSuite,
  setBoard,
  modalSettings,
}: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [step, setStep] = useState<Step>('suite');
  const history = useHistory();

  const nextStep = () => {
    setStep('boards');
  };

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    handleCloseModal();
    await dispatch(insertSuite(client, apiClient, suite));
    history.push(`/suites/${suite.key}`);
  };

  const Footer = () => {
    return (
      <MultiStepModalFooter>
        <Button variant="ghost" onClick={handleCloseModal}>
          Cancel
        </Button>
        <div>
          {isEqual(step, 'suite') && (
            <Button
              type="secondary"
              onClick={nextStep}
              disabled={isUndefined(board)}
            >
              {modalSettings.buttons[step].goToBoards}
            </Button>
          )}
          <Button type="primary" onClick={handleSubmit}>
            {modalSettings.buttons.save}
          </Button>
        </div>
      </MultiStepModalFooter>
    );
  };
  return (
    <Modal
      visible
      onCancel={handleCloseModal}
      headerText={modalSettings.header[step]}
      width={modalSettings.width[step]}
      footer={<Footer />}
    >
      <ModalContainer>
        {isEqual(step, 'suite') && (
          <SuiteForm suite={suite} setSuite={setSuite} />
        )}
        {isEqual(step, 'boards') && (
          <BoardForm
            suite={suite}
            board={board}
            setSuite={setSuite}
            setBoard={setBoard}
          />
        )}
      </ModalContainer>
    </Modal>
  );
};
