import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { RootDispatcher } from 'store/types';
import { insertSuite, deleteFiles } from 'store/suites/thunks';
import { modalClose } from 'store/modals/actions';
import { Button, Title } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer, DeleteModalFooter } from 'components/modals/elements';
import { Board, Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';

interface Props {
  suite: Suite;
  board: Board;
}

const DeleteBoard: React.FC<Props> = ({ board, suite }: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const handleDeleteSuite = async () => {
    metrics.track('DeleteBoard', {
      boardKey: board.key,
      board: board.title,
      suiteKey: suite.key,
      suite: suite.title,
      component: 'DeleteBoard',
    });
    handleCloseModal();
    if (board.imageFileId) {
      dispatch(deleteFiles(client, [board.imageFileId]));
    }
    await dispatch(
      insertSuite(client, apiClient, {
        ...suite,
        boards: suite.boards.filter((item) => item.key !== board.key),
      })
    );
  };

  const cancel = () => {
    metrics.track('Cancel_DeleteBoard', { component: 'DeleteBoard' });
    handleCloseModal();
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={cancel}>Keep board</Button>
      <Button
        type="danger"
        icon="Trash"
        iconPlacement="left"
        onClick={handleDeleteSuite}
      >
        Remove board
      </Button>
    </DeleteModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={cancel}
        headerText="Remove board?"
        footer={footer}
        width={400}
        underlineColor="#db0657"
      >
        <ModalContainer>
          <Title level={5}>Remove &quot;{board.title}&quot;?</Title>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default DeleteBoard;
