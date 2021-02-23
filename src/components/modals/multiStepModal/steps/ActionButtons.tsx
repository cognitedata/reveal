import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ActionButtonsContainer } from 'components/modals/elements';
import { useSelector, useDispatch } from 'react-redux';
import {
  isErrorListEmpty,
  suiteState,
  boardState,
} from 'store/forms/selectors';
import { addBoard, clearBoardForm, updateBoard } from 'store/forms/actions';
import isEmpty from 'lodash/isEmpty';
import { Board } from 'store/suites/types';
import { RootDispatcher } from 'store/types';
import { key } from 'utils/forms';
import {
  deleteFileFromQueue,
  flushFilesQueue,
  replaceNewFileKey,
} from 'utils/files';
import { useMetrics } from '@cognite/metrics';

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
  const metrics = useMetrics('EditSuite');

  const addNewBoard = () => {
    if (hasErrors) return;

    const newKey = key();
    replaceNewFileKey(filesUploadQueue, newKey); // if uploaded a file => give it a key
    dispatch(addBoard(newKey));

    metrics.track('AddNewBoard', {
      boardKey: newKey,
      board: board?.title,
      useEmbedTag: !!board?.embedTag,
      useImagePreview: filesUploadQueue.has(newKey),
    });
    dispatch(clearBoardForm());
  };

  const updateExistingBoard = () => {
    if (hasErrors) return;
    dispatch(updateBoard());
    metrics.track('UpdateBoard', {
      boardKey: board?.key,
      board: board?.title,
      useEmbedTag: !!board?.embedTag,
      useImagePreview: !!board.imageFileId || filesUploadQueue.has(board?.key),
    });
  };

  const clear = () => {
    if (board?.key) {
      deleteFileFromQueue(filesUploadQueue, board.key);
    } else {
      flushFilesQueue(filesUploadQueue);
    }
    metrics.track('Cancel_BoardForm', { component: 'BoardForm' });
    dispatch(clearBoardForm());
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
