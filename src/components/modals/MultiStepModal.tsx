import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite } from 'store/suites/types';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from './Modal';
import { CreateSuite, AddBoard } from './steps';
import { ModalContainer } from './elements';

type Step = 'suite' | 'boards';
type Mode = 'edit' | 'create';

interface Props {
  dataItem?: any;
  mode: Mode;
  handleCloseModal: any;
}

const stepModalSettings = {
  suite: {
    header: { create: 'Create a new suite', edit: 'Edit suite' },
    buttonNames: {
      create: { save: 'Create', goToBoards: 'Add boards' },
      edit: { save: 'Save', goToBoards: 'Edit boards' },
    },
    width: 536,
  },
  boards: {
    header: { create: 'Add board to suite', edit: 'Edit board' },
    buttonNames: {
      create: { save: 'Create', board: 'Add board' },
      edit: { save: 'Save', board: 'Update board' },
    },
    width: 904,
  },
};

const key = () => `_${Math.random().toString(36).substr(2, 9)}`;

export const MultiStepModal: React.FC<Props> = ({
  dataItem,
  mode,
  handleCloseModal,
}: Props) => {
  const board: any = dataItem?.boards[0] || {
    key: key(),
    type: '',
    title: '',
    url: '',
    embedTag: '',
    visibleTo: [],
  };

  const suite: Suite = dataItem || {
    key: key(),
    title: '',
    description: '',
    color: '#F4DAF8',
    boards: [],
  };

  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [newSuite, setNewSuite] = useState(suite);
  const [newBoard, setNewBoard] = useState(board);
  const [modalHeader, setModalHeader] = useState<string>('');
  const [step, setStep] = useState<Step>('suite');
  const [boardType, setBoardType] = useState(board.type);
  const [modalWidth, setModalWidth] = useState<number>(536);
  const history = useHistory();

  useEffect(() => {
    const { header, width } = stepModalSettings[step];
    setModalHeader(header[mode]);
    setModalWidth(width);
  }, [step, mode]);

  useEffect(() => {
    setNewBoard((prevState: any) => ({
      ...prevState,
      type: boardType?.value,
    }));
  }, [boardType]);

  const nextStep = () => {
    setStep('boards');
  };

  const handleClose = () => {
    handleCloseModal();
  };

  const addNewBoard = () => {
    if (mode === 'create') {
      setNewSuite((prevState: any) => ({
        ...prevState,
        boards: newSuite.boards.concat(newBoard),
      }));
      setNewBoard(board);
    } else {
      const boardIndex = newSuite.boards.findIndex(
        (element) => element.key === newBoard.key
      );
      const boardsCopy = [...newSuite.boards];
      boardsCopy[boardIndex] = { ...boardsCopy[boardIndex], ...newBoard };
      setNewSuite((prevState: any) => ({
        ...prevState,
        boards: boardsCopy,
      }));
    }
  };

  const handleSubmit = async () => {
    await dispatch(insertSuite(client, apiClient, newSuite));
    history.push(`/suites/${newSuite.key}`);
  };

  const handleSuiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setNewSuite((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBoardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setNewBoard((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBoardTypeChange = (selectedOption: any) => {
    setBoardType(selectedOption);
  };
  return (
    <>
      <Modal
        visible
        onCancel={handleClose}
        headerText={modalHeader}
        width={modalWidth}
        hasFooter={false}
      >
        <ModalContainer>
          {step === 'suite' && (
            <CreateSuite
              handleOnChange={handleSuiteChange}
              handleCloseModal={handleCloseModal}
              handleSubmit={handleSubmit}
              handleStepNext={nextStep}
              suiteValues={newSuite}
              buttonNames={stepModalSettings.suite.buttonNames}
              mode={mode}
            />
          )}
          {step === 'boards' && (
            <AddBoard
              handleOnChange={handleBoardChange}
              handleCloseModal={handleCloseModal}
              handleBoardTypeChange={handleBoardTypeChange}
              boardType={boardType}
              handleSubmit={handleSubmit}
              addNewBoard={addNewBoard}
              boards={newSuite?.boards}
              boardValues={newBoard}
              setNewBoard={setNewBoard}
              buttonNames={stepModalSettings.boards.buttonNames}
              mode={mode}
            />
          )}
        </ModalContainer>
      </Modal>
    </>
  );
};
