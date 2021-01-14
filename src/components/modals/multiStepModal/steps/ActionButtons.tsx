import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ActionButtonsContainer } from 'components/modals/elements';
import { useSelector, useDispatch } from 'react-redux';
import {
  isErrorListEmpty,
  suiteState,
  boardState,
} from 'store/forms/selectors';
import { addBoard, setBoard, updateBoard } from 'store/forms/actions';
import isEmpty from 'lodash/isEmpty';
import { Board } from 'store/suites/types';
import { RootDispatcher } from 'store/types';

const ActionButtons: React.FC = () => {
  const suite = useSelector(suiteState);
  const board = useSelector(boardState) as Board;
  const isValid =
    !isEmpty(board.title) && !isEmpty(board.type) && !isEmpty(board.url);
  const hasErrors = !useSelector(isErrorListEmpty) || !isValid;
  const dispatch = useDispatch<RootDispatcher>();

  const addNewBoard = () => {
    if (hasErrors) return;
    dispatch(addBoard());
    dispatch(setBoard({}));
  };

  const updateExistingBoard = () => {
    if (hasErrors) return;
    dispatch(updateBoard());
  };

  const clearForm = () => {
    dispatch(setBoard({}));
  };
  return (
    <ActionButtonsContainer>
      {board.key && !isEmpty(suite?.boards) ? (
        <>
          <Button variant="ghost" onClick={clearForm}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={updateExistingBoard}
            disabled={hasErrors}
          >
            Update board
          </Button>
        </>
      ) : (
        <Button type="primary" onClick={addNewBoard} disabled={hasErrors}>
          Add board
        </Button>
      )}
    </ActionButtonsContainer>
  );
};

export default ActionButtons;
