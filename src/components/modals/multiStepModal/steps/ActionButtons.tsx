import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ActionButtonsContainer } from 'components/modals/elements';
import { useSelector, useDispatch } from 'react-redux';
import {
  isErrorListEmpty,
  suiteState,
  boardState,
  filesUploadState,
} from 'store/forms/selectors';
import * as actions from 'store/forms/actions';
import isEmpty from 'lodash/isEmpty';
import { Board } from 'store/suites/types';
import { RootDispatcher } from 'store/types';
import { key } from 'utils/forms';
import {
  deleteFileFromQueue,
  flushFilesQueue,
  replaceNewFileKey,
} from 'utils/files';
import { useMetrics } from 'utils/metrics';

type Props = {
  filesUploadQueue: Map<string, File>;
};

const ActionButtons: React.FC<Props> = ({ filesUploadQueue }) => {
  const suite = useSelector(suiteState);
  const board = useSelector(boardState) as Board;
  const { deleteQueue } = useSelector(filesUploadState);
  const isValid =
    !isEmpty(board.title) && !isEmpty(board.type) && !isEmpty(board.url);
  const hasErrors = !useSelector(isErrorListEmpty) || !isValid;

  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');

  const addNewBoard = () => {
    if (hasErrors) return;

    const newKey = key();
    replaceNewFileKey(filesUploadQueue, newKey); // if uploaded a file => give it a key
    dispatch(actions.addBoard(newKey));
    metrics.track('AddNewBoard', {
      boardKey: newKey,
      board: board?.title,
      useEmbedTag: !!board?.embedTag,
      useImagePreview: filesUploadQueue.has(newKey),
    });
    dispatch(actions.clearBoardForm());
  };

  const updateExistingBoard = () => {
    if (hasErrors) return;
    if (deleteQueue.includes(board?.imageFileId)) {
      dispatch(actions.excludeFileFromBoard(board.imageFileId));
    }
    dispatch(actions.updateBoard());
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
    // remove current file from delete queue
    if (deleteQueue.includes(board?.imageFileId)) {
      dispatch(actions.excludeFileFromDeleteQueue(board.imageFileId));
    }
    dispatch(actions.clearBoardForm());
    metrics.track('Cancel_BoardForm', { component: 'BoardForm' });
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
