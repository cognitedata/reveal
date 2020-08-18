import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { FilesMetadata } from '@cognite/sdk';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { FileDetailsAbstract } from './FileDetailsAbstract';

const file: FilesMetadata = {
  id: 5927592366707648,
  createdTime: new Date(1580503121335),
  lastUpdatedTime: new Date(1580503121335),
  name: '001wdtQD',
  uploaded: true,
  metadata: {
    someAttribute: 'Some value',
    someOtherAttribute: 'Some other value',
  },
};

export default { title: 'Organisms/FileDetailsAbstract' };

export const Example = () => {
  return (
    <Container>
      <FileDetailsAbstract
        file={file}
        imgPreview={
          <img
            src="//unsplash.it/400/200"
            alt=""
            style={{ width: '100%', height: 'auto' }}
          />
        }
        files={[file]}
      >
        <Button>Hover me!</Button>
      </FileDetailsAbstract>
    </Container>
  );
};

export const WithActions = () => {
  return (
    <Container>
      <FileDetailsAbstract
        file={file}
        actions={[
          <Button type="primary">Click me</Button>,
          <Button>Click me too</Button>,
        ]}
      >
        <Button>Hover me!</Button>
      </FileDetailsAbstract>
    </Container>
  );
};

export const WithExtras = () => {
  return (
    <Container>
      <FileDetailsAbstract
        file={file}
        actions={[
          <Button type="primary">Click me</Button>,
          <Button>Click me too</Button>,
        ]}
        extras={
          <Button
            type="primary"
            variant="ghost"
            shape="round"
            icon="VerticalEllipsis"
          />
        }
      >
        <Button>Hover me!</Button>
      </FileDetailsAbstract>
    </Container>
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider
      resourcesState={[{ id: file.id, type: 'files', state: 'active' }]}
    >
      <Wrapper>{children}</Wrapper>
    </ResourceSelectionProvider>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;
