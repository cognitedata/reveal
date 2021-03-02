import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { RootDispatcher } from 'store/types';
import { deleteSuite } from 'store/suites/thunks';
import { modalClose } from 'store/modals/actions';
import { Button, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer, DeleteModalFooter } from 'components/modals/elements';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';

interface Props {
  suite: Suite;
}

const DeleteSuite: React.FC<Props> = ({ suite }: Props) => {
  const history = useHistory();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');

  const handleClose = () => {
    dispatch(modalClose());
  };

  const handleDeleteSuite = async () => {
    metrics.track('DeleteSuite', {
      suiteKey: suite.key,
      suite: suite.title,
    });
    handleClose();
    await dispatch(deleteSuite(client, apiClient, [{ key: suite.key }]));
    history.push('/');
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleClose}>Keep suite</Button>
      <Button
        type="danger"
        icon="Trash"
        iconPlacement="left"
        onClick={handleDeleteSuite}
      >
        Delete suite
      </Button>
    </DeleteModalFooter>
  );

  return (
    <>
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
    </>
  );
};

export default DeleteSuite;
