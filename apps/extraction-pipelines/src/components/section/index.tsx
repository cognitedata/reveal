import React from 'react';

import {
  Colors,
  Elevations,
  Flex,
  Icon,
  IconType,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import SectionItem, { SectionItemProps } from './SectionItem';

type SectionProps = {
  extra?: React.ReactNode;
  icon: IconType;
  title: string;
} & (
  | {
      children?: React.ReactNode;
      items?: never;
    }
  | {
      children?: never;
      items?: SectionItemProps[];
    }
);

const Section = ({
  children,
  extra,
  icon,
  items = [],
  title,
}: SectionProps): JSX.Element => {
  return (
    <StyledSectionContainer>
      <StyledSectionHeader $hasBorder={!!children || items.length > 0}>
        <Flex alignItems="center" gap={8}>
          <Icon type={icon} />
          <Title level={6}>{title}</Title>
        </Flex>
        {extra}
      </StyledSectionHeader>
      {children}
      {items.length > 0 && (
        <StyledSectionContent>
          {items.map((itemProps) => (
            <SectionItem {...itemProps} />
          ))}
        </StyledSectionContent>
      )}
    </StyledSectionContainer>
  );
};

const StyledSectionContainer = styled.div`
  background: ${Colors['surface--muted']};
  box-shadow: ${Elevations['elevation--surface--interactive']};
  border-radius: 8px;

  margin-bottom: 12px;
`;

const StyledSectionHeader = styled.div<{ $hasBorder?: boolean }>`
  ${({ $hasBorder }) =>
    $hasBorder &&
    `border-bottom: 1px solid ${Colors['border--interactive--default']}`};

  display: flex;
  justify-content: space-between;
  height: 52px;
  padding: 12px 16px;
`;

const StyledSectionContent = styled.div`
  padding: 16px;
`;

export default Section;
