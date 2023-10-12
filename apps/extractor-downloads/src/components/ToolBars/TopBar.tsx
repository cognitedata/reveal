import React from 'react';

import styled from 'styled-components';

import { Button, Flex } from '@cognite/cogs.js';

export const TopBar = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  return (
    <Container>
      <Flex justifyContent="space-between" style={{ width: '100%' }}>
        <Button
          type="ghost"
          icon="ChevronLeftSmall"
          size="small"
          onClick={onClick}
        >
          {title}
        </Button>
        <Button
          type="ghost"
          icon="Close"
          aria-label="clear"
          onClick={onClick}
        />
      </Flex>
    </Container>
  );
};

const Container = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  padding: 6px 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid
    var(--border-interactive-default, rgba(83, 88, 127, 0.16));
  background: var(--surface-muted, #fff);
`;
