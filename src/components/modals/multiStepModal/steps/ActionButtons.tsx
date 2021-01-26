import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ActionButtonsContainer } from 'components/modals/elements';
import { useSelector, useDispatch } from 'react-redux';
import {
  isErrorListEmpty,
  suiteState,
  boardState,
} from 'store/forms/selectors';
import { addBoard, clearForm, updateBoard } from 'store/forms/actions';
import isEmpty from 'lodash/isEmpty';
import { Board } from 'store/suites/types';
import { RootDispatcher } from 'store/types';
import { key } from 'utils/forms';
import {
  deleteFileFromQueue,
  flushFilesQueue,
  replaceNewFileKey,
} from 'utils/files';

type Props = {
  filesUploadQueue: Map<string, File>;
};

const ActionButtons: React.FC<Props> = ({ filesUploadQueue }) => {
  const suite = useSelector(suiteState);
  const board = useSelector(boardState) as Board;
  const isValid =
    !isEmpty(board.title) && !isEmpty(board.type) && !isEmpty(board.url);
  const hasErrors = !useSelector(isErrorListEmpty) || !isValid;
  const dispatch = useDispatch<RootDispatcher>();

  const addNewBoard = () => {
    if (hasErrors) return;

    const newKey = key();
    replaceNewFileKey(filesUploadQueue, newKey); // if uploaded a file => give it a key
    dispatch(addBoard(newKey));

    dispatch(clearForm());
  };

  const updateExistingBoard = () => {
    if (hasErrors) return;
    dispatch(updateBoard());
  };

  const clear = () => {
    if (board?.key) {
      deleteFileFromQueue(filesUploadQueue, board.key);
    } else {
      flushFilesQueue(filesUploadQueue);
    }
    dispatch(clearForm());
  };
  return (
    <ActionButtonsContainer>
      {board.key && !isEmpty(suite?.boards) ? (
        <>
          <Button variant="ghost" onClick={clear}>
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
