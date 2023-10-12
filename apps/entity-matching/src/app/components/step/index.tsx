import React from 'react';

import styled from 'styled-components';

import { Colors, Detail, Flex, Title } from '@cognite/cogs.js';

import { CENTERED_STEP_WIDTH } from '../../common/constants';

type StepProps = {
  children: React.ReactNode;
  isCentered?: boolean;
  subtitle?: string;
  title?: string;
};

const Step = ({
  children,
  isCentered,
  subtitle,
  title,
}: StepProps): JSX.Element => {
  return (
    <Container $isCentered={isCentered}>
      <Content $isCentered={isCentered} direction="column" gap={16}>
        {title || subtitle ? (
          <Flex direction="column">
            {title && <Title level={4}>{title}</Title>}
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </Flex>
        ) : (
          <></>
        )}
        <div>{children}</div>
      </Content>
    </Container>
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

const Container = styled(Flex)<{
  $isCentered?: boolean;
}>`
  justify-content: ${({ $isCentered }) => $isCentered && 'center'};
  height: 100%;
  width: 100%;
`;

const Content = styled(Flex).attrs({ direction: 'column', gap: 16 })<{
  $isCentered?: boolean;
}>`
  background-color: ${Colors['surface--muted']};
  border-left: ${({ $isCentered }) =>
    $isCentered && `1px solid ${Colors['border--interactive--default']}`};
  border-right: ${({ $isCentered }) =>
    $isCentered && `1px solid ${Colors['border--interactive--default']}`};
  min-height: 100%;
  height: max-content;
  padding: 24px;
  width: ${({ $isCentered }) =>
    $isCentered ? `${CENTERED_STEP_WIDTH}px` : '100%'};
`;

const Subtitle = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const Section = styled(Flex).attrs({ gap: 8, direction: 'column' })`
  &:not(:first-child) {
    border-top: 1px solid ${Colors['border--interactive--default']};
    margin-top: 16px;
    padding-top: 16px;
  }
`;

Step.Section = Section;
Step.SectionHeader = SectionHeader;

export default Step;
