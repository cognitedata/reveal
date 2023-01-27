import { Body, Flex, IconType, Infobar, Input } from '@cognite/cogs.js';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Card } from '../components/Card/Card';
import { Modal } from '../components/Modal/Modal';
import ModalFooter from '../components/Modal/ModalFooter';
import { dummyConventions } from '../service/conventions';

export const ConventionsContainer = () => {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prevState) => !prevState);
  const selectedConventionId = useRef<string | null>(null);

  return (
    <>
      {dummyConventions.map((item) => (
        <Card
          key={item.id}
          // icon={item.icon as IconType}
          title={item.title}
          subtitle={item.subtitle}
          structure={item.structure}
          onClick={() => {
            if (item.structure) {
              navigate(`/conventions/${item.id}`);
            } else {
              selectedConventionId.current = item.id;
              toggleVisibility();
            }
          }}
        />
      ))}

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
