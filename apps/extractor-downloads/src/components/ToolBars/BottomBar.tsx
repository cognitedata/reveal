import React from 'react';

import styled from 'styled-components';

import { Body, Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

export const BottomBar = ({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{ width: '100%', minWidth: 350 }}
      >
        <Body size="x-small" muted>
          {title}
        </Body>
        <Button type="primary" size="medium" onClick={onSubmit}>
          {t('create-connection')}
        </Button>
      </Flex>
    </Container>
  );
};

const Container = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  padding: 16px 420px 16px 420px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-top: 1px solid
    var(--border-interactive-default, rgba(83, 88, 127, 0.16));
  background: var(--surface-muted, #fff);
`;
