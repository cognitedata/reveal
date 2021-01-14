import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { modalClose } from 'store/modals/actions';
import { Button, Body, Title } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer, DeleteModalFooter } from 'components/modals/elements';
import { Board, Suite } from 'store/suites/types';

interface Props {
  suite: Suite;
  board: Board;
}

const DeleteBoard: React.FC<Props> = ({ board, suite }: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const handleDeleteSuite = async () => {
    handleCloseModal();
    await dispatch(
      insertSuite(client, apiClient, {
        ...suite,
        boards: suite.boards.filter((item) => item.key !== board.key),
      })
    );
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleCloseModal}>Keep Board</Button>
      <Button
        type="danger"
        icon="Trash"
        iconPlacement="left"
        onClick={handleDeleteSuite}
      >
        Remove Board
      </Button>
    </DeleteModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleCloseModal}
        headerText="Remove board?"
        footer={footer}
        width={400}
        underlineColor="#db0657"
      >
        <ModalContainer>
          <Title level={5}>Remove &quot;{board.title}&quot;?</Title>
          <Body level={1}>It will be removed permanently</Body>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default DeleteBoard;
