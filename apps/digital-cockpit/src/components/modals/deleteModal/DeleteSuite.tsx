import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { RootDispatcher } from 'store/types';
import { deleteSuite, deleteFiles } from 'store/suites/thunks';
import { deleteChildSuite } from 'store/forms/thunks';
import { modalClose } from 'store/modals/actions';
import { Button, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer, DeleteModalFooter } from 'components/modals/elements';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { deleteLayoutItems } from 'store/layout/thunks';
import { getSuites } from 'store/suites/selectors';

interface Props {
  suiteItem: Suite;
}

const DeleteSuite: React.FC<Props> = ({ suiteItem: suite }: Props) => {
  const history = useHistory();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');
  const suites = useSelector(getSuites);
  const parentSuite = suite.parent
    ? suites?.find((st) => st.key === suite.parent)
    : null;

  const handleClose = () => {
    dispatch(modalClose());
  };

  const handleDeleteSuite = async () => {
    metrics.track('DeleteSuite', {
      suiteKey: suite.key,
      suite: suite.title,
    });
    handleClose();

    // delete image preview files from the suite and from boards
    const imageFileIds = suite.boards.reduce<string[]>(
      (acc, board) => {
        if (board.imageFileId) {
          acc.push(board.imageFileId);
        }
        return acc;
      },
      suite.imageFileId ? [suite.imageFileId] : []
    );

    if (imageFileIds.length) {
      dispatch(deleteFiles(client, imageFileIds));
    }
    const layoutItems = suite.boards.map((board) => board.key);

    if (parentSuite) {
      // remove a key from the parent suite and save
      await dispatch(
        deleteChildSuite(apiClient, parentSuite as Suite, suite.key)
      );
    }

    // delete the suite
    await dispatch(deleteSuite(apiClient, suite.key));

    // delete boards layout items
    await dispatch(deleteLayoutItems(apiClient, layoutItems));
    // go to parent suite if it exist
    history.push(parentSuite ? `/suites/${parentSuite.key}` : '/');
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleClose}>Keep suite</Button>
      <Button
        type="danger"
        icon="Delete"
        iconPlacement="left"
        onClick={handleDeleteSuite}
      >
        Delete suite
      </Button>
    </DeleteModalFooter>
  );

  return (
    <Modal
      visible
      onCancel={handleClose}
      headerText="Delete suite?"
      footer={footer}
      width={400}
      underlineColor="#db0657"
    >
      <ModalContainer>
        <Title level={5}>Delete &quot;{suite.title}&quot;?</Title>
      </ModalContainer>
    </Modal>
  );
};

export default DeleteSuite;
