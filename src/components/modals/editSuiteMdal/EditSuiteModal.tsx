import React, { useState } from 'react';
import { Suite, Board } from 'store/suites/types';
import { modalSettings } from 'components/modals/config';
import { TS_FIX_ME } from 'types/core';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

interface Props {
  dataItem: TS_FIX_ME;
}

const EditSuiteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const [newSuite, setNewSuite] = useState<Suite>(dataItem);
  const [newBoard, setNewBoard] = useState<Board>(dataItem?.boards[0]);

  const updateBoard = () => {
    const boardIndex = newSuite.boards.findIndex((element: Board) =>
      isEqual(element.key, newBoard.key)
    );
    const boardsCopy = cloneDeep(newSuite.boards);
    boardsCopy[boardIndex] = merge(boardsCopy[boardIndex], newBoard);
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
