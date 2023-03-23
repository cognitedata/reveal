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
      <div>{children}</div>
    </Flex>
  );
};

type SectionHeaderProps = {
  subtitle?: string;
  title: string;
};

const SectionHeader = ({ subtitle, title }: SectionHeaderProps) => {
  return (
    <Flex direction="column" gap={4}>
      <Title level={6}>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Flex>
  );
};

const Subtitle = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const Section = styled(Flex).attrs({ gap: 16, direction: 'column' })`
  &:not(:first-child) {
    border-top: 1px solid ${Colors['border--interactive--default']};
    margin-top: 16px;
    padding-top: 16px;
  }
`;

Step.Section = Section;
Step.SectionHeader = SectionHeader;

export default Step;
