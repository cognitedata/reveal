import React, { useState } from 'react';
import { key } from '_helpers/generateKey';
import { Suite, Board } from 'store/suites/types';
import { modalSettings } from 'components/modals/config';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

const board: Board = {
  key: key(),
  type: 'other',
  title: '',
  url: '',
  embedTag: '',
  visibleTo: [],
};

const suite: Suite = {
  key: key(),
  title: '',
  description: '',
  color: '#F4DAF8',
  boards: [],
};

const CreateSuiteModal: React.FC = () => {
  const [newSuite, setNewSuite] = useState<Suite>(suite);
  const [newBoard, setNewBoard] = useState<Board>(board);

  const addNewBoard = () => {
    setNewSuite((prevState: Suite) => ({
      ...prevState,
      boards: newSuite.boards.concat(newBoard),
    }));
    setNewBoard({ ...board, key: key() });
  };

  return (
    <MultiStepModal
      boardAction={addNewBoard}
      suite={newSuite}
      board={newBoard}
      setSuite={setNewSuite}
      setBoard={setNewBoard}
      modalSettings={modalSettings.create}
    />
  );
};

export default CreateSuiteModal;
