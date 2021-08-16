import { Button, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Header = ({
  title = 'Type',
  count = 0,
  onClickNew = () => {
    console.error('on Click New have not implemented ');
  },
}: {
  title?: string;
  count?: number;
  onClickNew?: () => void;
}) => (
  <Container>
    <Title level={6} as="span">
      {title} ({count})
    </Title>
    <Button
      type="secondary"
      size="small"
      icon="PlusCompact"
      onClick={onClickNew}
    >
      New
    </Button>
  </Container>
);

const Container = styled.div`
  display: grid;
  grid-auto-flow: column;
  height: 50px;
  align-items: center;
  padding: 0px 12px;
  justify-content: space-between;
  border-bottom: 1px solid #d9d9d9;
`;
