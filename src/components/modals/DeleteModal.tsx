import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { RootDispatcher } from 'store/types';
import { deleteSuite } from 'store/suites/thunks';
import { Button, Body, Title } from '@cognite/cogs.js';
import Modal from './Modal';
import { ModalContainer, DeleteModalFooter } from './elements';

interface Props {
  dataItem: any;
}

export const DeleteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const handleCLoseModal = () => {
    setIsOpen(false);
  };

  const handleDeleteSuite = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    await dispatch(deleteSuite(client, [{ key: dataItem.key }]));
  };

  const footer = (
    <DeleteModalFooter>
      <Button onClick={handleCLoseModal}>Keep Suite</Button>
      <Button type="primary" onClick={handleDeleteSuite}>
        Delete Suite
      </Button>
    </DeleteModalFooter>
  );

  return (
    <>
      <Modal
        visible={isOpen}
        onCancel={handleCLoseModal}
        headerText="Delete this suite?"
        footer={footer}
        width={400}
      >
        <ModalContainer>
          <Title level={5}>Delete &quot;{dataItem.title}&quot;?</Title>
          <Body level={1}>It will be deleted pemanently</Body>
        </ModalContainer>
      </Modal>
    </>
  );
};
