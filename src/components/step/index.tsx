import { Colors, Detail, Flex, Title } from '@cognite/cogs.js';
import React from 'react';

import styled from 'styled-components';

type StepProps = {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
};

const Step = ({ children, subtitle, title }: StepProps): JSX.Element => {
  return (
    <Flex direction="column" gap={16}>
      <Flex direction="column">
        <Title level={4}>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Flex>
      <Content>{children}</Content>
    </Flex>
  );
};

const Subtitle = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const Content = styled.div``;

export default Step;
