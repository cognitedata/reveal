import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import GlobalStyle from 'styles/global-styles';
import theme from 'styles/theme';
import { FilesMetadata } from '@cognite/sdk';

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

export default { title: 'Organisms|FileDetailsAbstract' };

export const Example = () => {
  return (
    <Container>
      <FileDetailsAbstract
        file={file}
        imgPreview={<img src="//unsplash.it/400/200" alt="" />}
      >
        <Button>Hover me!</Button>
      </FileDetailsAbstract>
      <GlobalStyle theme={theme} />
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

const Container = styled.div`
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
