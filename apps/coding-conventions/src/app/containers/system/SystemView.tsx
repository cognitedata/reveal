import { Body, Flex, Infobar, Input } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../../components/Modal/Modal';
import ModalFooter from '../../components/Modal/ModalFooter';
import { SystemList } from './SystemList';

export const SystemView = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prevState) => !prevState);

  return (
    <>
      <SystemList toggleVisibility={toggleVisibility} />

      <Modal
        visible={visible}
        modalWidth="350px"
        modalHeight="275px"
        onCancel={toggleVisibility}
        title="Setup coding structure"
        footer={<ModalFooter onCancel={toggleVisibility} />}
      >
        <Flex gap={8} direction="column">
          <Subtitle>Specify the coding structure:</Subtitle>
          <SearchInput fullWidth placeholder="ZZZZZZ NN-NN-NN NNN" />

          <Infobar type="danger">
            NB! This cannot be changed after creating - WIP: Revisions
          </Infobar>
        </Flex>
      </Modal>
    </>
  );
};

const SearchInput = styled(Input)`
  border: 2px solid rgba(83, 88, 127, 0.16) !important;
`;

const Subtitle = styled(Body)`
  padding-top: 4px;
`;
