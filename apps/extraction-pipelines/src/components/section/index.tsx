import React from 'react';

import { Colors, Flex, Icon, IconType, Title } from '@cognite/cogs.js';
import isString from 'lodash/isString';
import styled from 'styled-components';

import SectionItem, { SectionItemProps } from './SectionItem';
import { Box } from '@extraction-pipelines/components/box/Box';

type SectionProps = {
  className?: string;
  borderless?: boolean;
  extra?: React.ReactNode;
  icon?: IconType;
  title: React.ReactNode;
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
  borderless,
  children,
  className,
  extra,
  icon,
  items = [],
  title,
}: SectionProps): JSX.Element => {
  return (
    <StyledSectionContainer className={className}>
      <StyledSectionHeader
        $hasBorder={!borderless && (!!children || items.length > 0)}
      >
        <Flex alignItems="center" gap={8}>
          {icon && <Icon type={icon} />}
          {isString(title) ? <Title level={6}>{title}</Title> : title}
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

const StyledSectionContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

const StyledSectionHeader = styled.div<{ $hasBorder?: boolean }>`
  ${({ $hasBorder }) =>
    $hasBorder &&
    `border-bottom: 1px solid ${Colors['border--interactive--disabled']}`};

  display: flex;
  justify-content: space-between;
  min-height: 53px;
  padding: 12px 16px;
`;

const StyledSectionContent = styled.div`
  padding: 16px;
`;

export default Section;
