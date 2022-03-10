import { Button, Flex, Input, ToastContainer } from '@cognite/cogs.js';
import { ExternalLabelDefinition } from '@cognite/sdk';
import { Modal } from 'src/components/modal/Modal';
import { ModalProps } from 'src/components/modal/types';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 1rem;

  & > * {
    margin-top: 1rem;
  }

  .input-wrapper,
  input {
    width: 100%;
  }
`;

interface Props extends ModalProps {
  onCreateClick: ({
    name,
    externalId,
    description,
  }: ExternalLabelDefinition) => void;
  isCreatingLabel?: boolean;
}

export const CreateLabelModal: React.FC<Props> = ({
  onCreateClick,
  visible,
  toggleVisibility,
  isCreatingLabel,
}) => {
  const [name, setName] = React.useState<string>('');
  const [externalId, setExternalId] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const isRequiredFieldsFilled = name.length && externalId.length;

  return (
    <Modal
      modalSize="25rem"
      title="Create new label"
      visible={visible}
      footer={
        <Flex justifyContent="flex-end">
          <Button onClick={() => toggleVisibility()}>Cancel</Button>
          <Button
            type="primary"
            disabled={!isRequiredFieldsFilled}
            loading={isCreatingLabel}
            onClick={() => {
              onCreateClick({
                name,
                externalId,
                description,
              });
            }}
          >
            Create label
          </Button>
        </Flex>
      }
      onCancel={() => toggleVisibility()}
    >
      <>
        <Container>
          <Input
            title="Name *"
            placeholder="Choose a label name"
            required
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            title="External id *"
            placeholder="Choose an external id"
            required
            maxLength={140}
            onChange={(e) => setExternalId(e.target.value)}
            value={externalId}
          />
          <Input
            title="Description"
            placeholder=""
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Container>
        <ToastContainer />
      </>
    </Modal>
  );
};
