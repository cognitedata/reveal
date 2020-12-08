import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite } from 'store/suites/types';
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
  const dashboard: any = dataItem?.dashboards[0] || {
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
    dashboards: [],
  };

  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [newSuite, setNewSuite] = useState(suite);
  const [newBoard, setNewBoard] = useState(dashboard);
  const [modalHeader, setModalHeader] = useState<string>('');
  const [step, setStep] = useState<Step>('suite');
  const [boardType, setBoardType] = useState(dashboard.type);
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
        dashboards: newSuite.dashboards.concat(newBoard),
      }));
      setNewBoard(dashboard);
    } else {
      const boardIndex = newSuite.dashboards.findIndex(
        (element) => element.key === newBoard.key
      );
      const boardsCopy = [...newSuite.dashboards];
      boardsCopy[boardIndex] = { ...boardsCopy[boardIndex], ...newBoard };
      setNewSuite((prevState: any) => ({
        ...prevState,
        dashboards: boardsCopy,
      }));
    }
  };

  const handleSubmit = async () => {
    await dispatch(insertSuite(client, newSuite));
    history.push(`/suites/${newSuite.key}`);
  };

  const handleSuiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setNewSuite((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDashboardChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
              handleOnChange={handleDashboardChange}
              handleBoardTypeChange={handleBoardTypeChange}
              boardType={boardType}
              handleSubmit={handleSubmit}
              addNewBoard={addNewBoard}
              boards={newSuite?.dashboards}
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
