import { Button } from '@cognite/cogs.js';
import { useDialog } from '@data-exploration-lib/core';

import React from 'react';
import styled from 'styled-components';
import { BulkActionbar } from './BulkActionbar';

export default {
  title: 'Component/BulkActionbar',
  component: BulkActionbar,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const { toggle, isOpen, close } = useDialog();

  return (
    <Container>
      <Button onClick={toggle}>Click here</Button>
      <BulkActionbar title="Random" subtitle="213" isVisible={isOpen}>
        <Button icon="Add" inverted type="secondary">
          Add to Collection
        </Button>
        <BulkActionbar.Separator />
        <Button icon="Close" onClick={close} inverted />
      </BulkActionbar>
      ;
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  display: flex;
  position: relative;
  min-height: 100%;
`;
