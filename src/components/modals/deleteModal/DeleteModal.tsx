import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { RootDispatcher } from 'store/types';
import { deleteSuite } from 'store/suites/thunks';
import { modalClose } from 'store/modals/actions';
import { Button, Body, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalContainer, DeleteModalFooter } from 'components/modals/elements';
import { TS_FIX_ME } from 'types/core';

interface Props {
  dataItem: TS_FIX_ME;
}

const DeleteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const history = useHistory();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const handleClose = () => {
    dispatch(modalClose());
  };

  const handleDeleteSuite = async () => {
    await dispatch(deleteSuite(client, apiClient, [{ key: dataItem.key }]));
    handleClose();
    history.push('/');
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleClose}>Keep Suite</Button>
      <Button
        type="danger"
        icon="Trash"
        iconPlacement="left"
        onClick={handleDeleteSuite}
      >
        Delete Suite
      </Button>
    </DeleteModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleClose}
        headerText="Delete this suite?"
        footer={footer}
        width={400}
        underlineColor="#db0657"
      >
        <ModalContainer>
          <Title level={5}>Delete &quot;{dataItem.title}&quot;?</Title>
          <Body level={1}>
            The suite and all its configured boards will be deleted permanently
          </Body>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default DeleteModal;
