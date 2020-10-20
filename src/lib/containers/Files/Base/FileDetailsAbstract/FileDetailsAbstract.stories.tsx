import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { ResourceSelectionProvider } from 'lib/context/ResourceSelectionContext';
import { files } from 'stubs/files';
import { FileDetailsAbstract } from './FileDetailsAbstract';

export default {
  title: 'Files/Base/FileDetailsAbstract',
  component: FileDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <FileDetailsAbstract
      file={files[0]}
      imgPreview={
        <img
          src="//unsplash.it/400/200"
          alt=""
          style={{ width: '100%', height: 'auto' }}
        />
      }
      files={files}
    />
  );
};

export const WithActions = () => {
  return (
    <FileDetailsAbstract
      file={files[0]}
      actions={[
        <Button key="1" type="primary">
          Click me
        </Button>,
        <Button key="2">Click me too</Button>,
      ]}
    >
      <Button>Hover me!</Button>
    </FileDetailsAbstract>
  );
};

export const WithExtras = () => {
  return (
    <FileDetailsAbstract
      file={files[0]}
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
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider
      resourcesState={[{ id: files[0].id, type: 'files', state: 'active' }]}
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
