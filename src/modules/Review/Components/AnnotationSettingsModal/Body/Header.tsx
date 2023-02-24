import React from 'react';
import { Button, Title, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Header = ({
  title = 'Type',
  count = 0,
  disabledMessage,
  onClickNew = () => {
    console.error('on Click New have not implemented ');
  },
}: {
  title?: string;
  count?: number;
  disabledMessage?: string;
  onClickNew?: () => void;
}) => (
  <Container>
    <Title level={6} as="span">
      {title} ({count})
    </Title>
    <Tooltip
      content={<span data-testid="text-content">{disabledMessage}</span>}
      disabled={!disabledMessage}
    >
      <Button
        type="secondary"
        size="small"
        icon="Add"
        onClick={onClickNew}
        disabled={!!disabledMessage}
      >
        New
      </Button>
    </Tooltip>
  </Container>
);

const Container = styled.div`
  display: grid;
  grid-auto-flow: column;
  height: 50px;
  align-items: center;
  padding: 0 12px;
  justify-content: space-between;
  border-bottom: 1px solid #d9d9d9;
`;
