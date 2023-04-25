import React from 'react';

import {
  Body,
  Colors,
  Elevations,
  Flex,
  Icon,
  IconType,
} from '@cognite/cogs.js';
import styled from 'styled-components';

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
        <Body level={2} strong>
          {content}
        </Body>
      </Flex>
      <Icon size={24} type={icon} />
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

const BoxTitle = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;
