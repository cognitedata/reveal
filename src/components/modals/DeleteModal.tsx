import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { RootDispatcher } from 'store/types';
import { deleteSuite } from 'store/suites/thunks';
import { Button, Body, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from './Modal';
import { ModalContainer, DeleteModalFooter } from './elements';

interface Props {
  dataItem: any;
  handleCloseModal: any;
}

export const DeleteModal: React.FC<Props> = ({
  dataItem,
  handleCloseModal,
}: Props) => {
  const history = useHistory();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const handleDeleteSuite = async () => {
    await dispatch(deleteSuite(client, apiClient, [{ key: dataItem.key }]));
    history.push('/');
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleCloseModal}>Keep Suite</Button>
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
        onCancel={handleCloseModal}
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
