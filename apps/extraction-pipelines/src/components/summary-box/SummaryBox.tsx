import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Heading, Icon, IconType } from '@cognite/cogs.js';

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
      <IconContainer>
        <Icon size={16} type={icon} />
      </IconContainer>

      <Flex direction="column" gap={4}>
        <BoxTitle size="x-small" strong>
          {title}
        </BoxTitle>
        <Heading level={6}>{content}</Heading>
      </Flex>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: ${Colors['text-icon--muted']};
`;

const BoxTitle = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f9f9fb;
  display: flex;
  justify-content: center;
  align-items: center;
`;
