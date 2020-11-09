import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button } from '@cognite/cogs.js';
import { CollectionSpec } from 'lib/hooks/CollectionsHooks';

interface Props {
  onCreate: (newCollection: Omit<CollectionSpec, 'type'>) => void;
  onClose: () => void;
}

const CreateCollectionForm = ({ onCreate, onClose }: Props) => {
  const [name, setName] = useState<string>('');

  const onCreateButtonClick = () => {
    const newCollection: Omit<CollectionSpec, 'type'> = {
      name,
      operationType: 'retrieve',
      operationBody: {},
    };
    onCreate(newCollection);
    setName('');
    onClose();
  };

  return (
    <FormContent>
      <FormBody>
        <Input
          title="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          label="Name"
          fullWidth
          style={{ marginBottom: 8 }}
        />
      </FormBody>
      <FormActions>
        <Button onClick={() => onClose()} style={{ marginRight: 12 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={onCreateButtonClick}
          disabled={name === ''}
        >
          Create and add
        </Button>
      </FormActions>
    </FormContent>
  );
};

export default CreateCollectionForm;

const FormContent = styled.div`
  padding: 8px 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FormBody = styled.div`
  flex-grow: 1;
`;

const FormActions = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
`;
