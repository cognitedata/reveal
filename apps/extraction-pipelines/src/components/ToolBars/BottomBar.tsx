import React from 'react';

import styled from 'styled-components';

import { Body, Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

export const BottomBar = ({
  className,
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: () => void;
  className?: string;
}) => {
  const { t } = useTranslation();
  return (
    <Container className={className}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{ width: '100%', minWidth: 350 }}
      >
        <Body size="x-small" muted>
          {title}
        </Body>
        <Button type="primary" size="medium" onClick={onSubmit}>
          {t('done')}
        </Button>
      </Flex>
    </Container>
  );
};

const Container = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  background: var(--surface-muted, #fff);
`;
