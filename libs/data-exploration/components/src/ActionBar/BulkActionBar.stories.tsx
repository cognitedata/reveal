import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { useDialog } from '@data-exploration-lib/core';

import { BulkActionBar } from './BulkActionBar';

export default {
  title: 'Component/BulkActionBar',
  component: BulkActionBar,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const { toggle, isOpen, close } = useDialog();

  return (
    <Container>
      <Button onClick={toggle}>Click here</Button>
      <BulkActionBar title="Random" subtitle="213" isVisible={isOpen}>
        <Button icon="Add" inverted type="secondary">
          Add to Collection
        </Button>
        <BulkActionBar.Separator />
        <Button icon="Close" onClick={close} inverted />
      </BulkActionBar>
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
