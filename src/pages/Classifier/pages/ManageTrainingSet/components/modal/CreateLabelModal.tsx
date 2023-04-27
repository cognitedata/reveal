import { Modal, Input, ToastContainer } from '@cognite/cogs.js';
import { ExternalLabelDefinition } from '@cognite/sdk';
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

export const CreateLabelModal = ({
  onCreateClick,
  visible,
  toggleVisibility,
  // TODO: Find a suitable alternative visual cue to indicate the label creation state,
  // as the previous loading animation within the create button is no longer available.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCreatingLabel,
}: {
  visible?: boolean;
  isCreatingLabel?: boolean;
  toggleVisibility: () => void;
  onCreateClick: ({
    name,
    externalId,
    description,
  }: ExternalLabelDefinition) => void;
}) => {
  const [name, setName] = React.useState<string>('');
  const [externalId, setExternalId] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const isRequiredFieldsFilled = name.length && externalId.length;

  return (
    <Modal
      size="small"
      title="Create new label"
      okText="Create label"
      okDisabled={!isRequiredFieldsFilled}
      visible={visible}
      onOk={() =>
        onCreateClick({
          name,
          externalId,
          description,
        })
      }
      onCancel={toggleVisibility}
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
