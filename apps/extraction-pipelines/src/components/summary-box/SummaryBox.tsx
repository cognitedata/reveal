import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Icon, IconType, Title } from '@cognite/cogs.js';

import { Box } from '../box/Box';

type SummaryBoxProps = {
  className?: string;
  content: string;
  icon: IconType;
  title: string;
};

export const SummaryBox = ({
  className,
  content,
  icon,
  title,
}: SummaryBoxProps): JSX.Element => {
  return (
    <Container className={className}>
      <Flex direction="column" gap={4}>
        <BoxTitle level={3} strong>
          {title}
        </BoxTitle>
        <Title level={6}>{content}</Title>
      </Flex>
      <Icon size={24} type={icon} />
    </Container>
  );
};

const Container = styled(Box)`
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

const BoxTitle = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;
