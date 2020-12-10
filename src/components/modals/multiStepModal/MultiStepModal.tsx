import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite, Board } from 'store/suites/types';
import { MultiStepModalFooter } from 'components/modals/elements';
import { TS_FIX_ME } from 'types/core';
import { modalClose } from 'store/modals/actions';
import { SuiteStep, BoardStep } from './steps';
import Modal from '../simpleModal/Modal';
import { ModalContainer } from '../elements';

type Step = 'suite' | 'boards';

interface Props {
  suite: Suite;
  board: Board;
  boardAction: () => void;
  setSuite: TS_FIX_ME;
  setBoard: TS_FIX_ME;
  modalSettings: TS_FIX_ME;
}

export const MultiStepModal: React.FC<Props> = ({
  suite,
  board,
  boardAction,
  setSuite,
  setBoard,
  modalSettings,
}: Props) => {
  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [step, setStep] = useState<Step>('suite');
  // const [boardType, setBoardType] = useState(board.type);
  const history = useHistory();

  // useEffect(() => {
  //   setNewBoard((prevState: any) => ({
  //     ...prevState,
  //     type: boardType?.value,
  //   }));
  // }, [boardType]);

  const nextStep = () => {
    setStep('boards');
  };

  const handleClose = () => {
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    await dispatch(insertSuite(client, suite));
    handleClose();
    history.push(`/suites/${suite.key}`);
  };

  const handleSuiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSuite((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBoardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setBoard((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleBoardTypeChange = (selectedOption: any) => {
  //   setBoardType(selectedOption);
  // };

  const Footer = () => {
    return (
      <MultiStepModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <div>
          {step === 'suite' && (
            <Button type="secondary" onClick={nextStep}>
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
      onCancel={handleClose}
      headerText={modalSettings.header[step]}
      width={modalSettings.width[step]}
      footer={<Footer />}
    >
      <ModalContainer>
        {step === 'suite' && (
          <SuiteStep handleOnChange={handleSuiteChange} suiteValues={suite} />
        )}
        {step === 'boards' && (
          <BoardStep
            handleOnChange={handleBoardChange}
            // handleBoardTypeChange={handleBoardTypeChange}
            // boardType={boardType}
            actionButton={
              <Button type="secondary" onClick={boardAction}>
                {modalSettings.buttons.boards.board}
              </Button>
            }
            boards={suite?.boards}
            boardValues={board}
            setNewBoard={setBoard}
          />
        )}
      </ModalContainer>
    </Modal>
  );
};
