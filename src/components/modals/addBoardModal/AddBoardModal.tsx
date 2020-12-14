import React, { useState, useContext } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Suite, Board } from 'store/suites/types';
import { modalClose } from 'store/modals/actions';
import { Button } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { BoardForm } from 'components/modals/multiStepModal/steps';
import { modalSettings } from 'components/modals/config';
import { key } from '_helpers/generateKey';
import { SpaceBetween } from 'styles/common';
import { ModalContainer } from 'components/modals/elements';

const board: Board = {
  key: key(),
  type: null,
  title: '',
  url: '',
  embedTag: '',
  visibleTo: [],
};

interface Props {
  suite: Suite;
}

const AddBoardModal: React.FC<Props> = ({ suite }: Props) => {
  const [newSuite, setNewSuite] = useState<Suite>(suite);
  const [newBoard, setNewBoard] = useState<Board>(board);
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    handleCloseModal();
    await dispatch(insertSuite(client, apiClient, suite));
  };

  const addNewBoard = () => {
    setNewSuite((prevState: Suite) => ({
      ...prevState,
      boards: newSuite.boards.concat(newBoard),
    }));
    setNewBoard({ ...board, key: key() });
  };

  const deleteBoard = (event: React.MouseEvent, boardKey: string) => {
    event.stopPropagation();
    setNewSuite((prevState: Suite) => ({
      ...prevState,
      boards: suite.boards.filter((item) => item.key !== boardKey),
    }));
    setNewBoard(suite.boards[0]);
  };

  const footer = (
    <SpaceBetween>
      <Button variant="ghost" onClick={handleCloseModal}>
        Cancel
      </Button>

      <Button type="primary" onClick={handleSubmit}>
        {modalSettings.create.buttons.save}
      </Button>
    </SpaceBetween>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleCloseModal}
        headerText="Add board to suite"
        footer={footer}
        width={modalSettings.create.width.boards}
      >
        <ModalContainer>
          <BoardForm
            actionButton={
              <Button type="secondary" onClick={addNewBoard}>
                {modalSettings.create.buttons.boards.board}
              </Button>
            }
            boards={newSuite?.boards}
            boardValues={newBoard}
            setBoard={setNewBoard}
            deleteBoard={deleteBoard}
          />
        </ModalContainer>
      </Modal>
    </>
  );
};

export default AddBoardModal;
