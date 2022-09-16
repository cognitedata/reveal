import React from 'react';

import {
  Button,
  ButtonProps,
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
  extraButton?: ButtonProps;
  icon: IconType;
  items: SectionItemProps[];
  title: string;
};

const Section = ({
  extraButton,
  icon,
  items,
  title,
}: SectionProps): JSX.Element => {
  return (
    <StyledSectionContainer>
      <StyledSectionHeader>
        <Flex alignItems="center" gap={8}>
          <Icon type={icon} />
          <Title level={6}>{title}</Title>
        </Flex>
        {extraButton && (
          <Button
            {...extraButton}
            onClick={(e) => {
              e.stopPropagation();
              extraButton.onClick?.(e);
            }}
          />
        )}
      </StyledSectionHeader>
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
`;

const StyledSectionHeader = styled.div`
  padding: 16px;
`;

const StyledSectionContent = styled.div`
  border-top: 1px solid ${Colors['border--interactive--default']};
  padding: 16px;
`;

export default Section;
