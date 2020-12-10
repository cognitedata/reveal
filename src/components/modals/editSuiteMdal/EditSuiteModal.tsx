import React, { useState } from 'react';
import { Suite, Board } from 'store/suites/types';
import { modalSettings } from 'components/modals/config';
import { TS_FIX_ME } from 'types/core';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

interface Props {
  dataItem: TS_FIX_ME;
}

const EditSuiteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const [newSuite, setNewSuite] = useState<Suite>(dataItem);
  const [newBoard, setNewBoard] = useState<Board>(dataItem?.boards[0]);

  const updateBoard = () => {
    const boardIndex = newSuite.boards.findIndex(
      (element: Board) => element.key === newBoard.key
    );
    const boardsCopy = [...newSuite.boards];
    boardsCopy[boardIndex] = { ...boardsCopy[boardIndex], ...newBoard };
    setNewSuite((prevState: Suite) => ({
      ...prevState,
      boards: boardsCopy,
    }));
  };
  return (
    <MultiStepModal
      boardAction={updateBoard}
      suite={newSuite}
      board={newBoard}
      setSuite={setNewSuite}
      setBoard={setNewBoard}
      modalSettings={modalSettings.edit}
    />
  );
};

export default EditSuiteModal;
