import React from 'react';
import {
  Button,
  Colors,
  Detail,
  Dropdown,
  DropdownProps,
  Flex,
  Title,
} from '@cognite/cogs.js';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SecondaryTopbarDivider from './SecondaryTopbarDivider';

type SecondaryTopbarProps = {
  dropdownProps?: Omit<DropdownProps, 'children'>;
  extraContent?: React.ReactNode;
  extraContentLeft?: React.ReactNode;
  goBackFallback?: string;
  optionsDropdownProps?: Omit<DropdownProps, 'children'>;
  subtitle?: string;
  title: string;
};

export const SecondaryTopbar = ({
  dropdownProps,
  extraContent,
  extraContentLeft,
  goBackFallback,
  optionsDropdownProps,
  subtitle,
  title,
}: SecondaryTopbarProps): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBackClick = () => {
    if (location.key === 'default' && goBackFallback !== undefined) {
      navigate(goBackFallback);
    } else {
      navigate(-1);
    }
  };

  return (
    <StyledContainer>
      <Flex alignItems="center" gap={16}>
        <Button icon="ArrowLeft" onClick={handleGoBackClick} />
        <Flex alignItems="center" gap={8}>
          <Flex direction="column" gap={2}>
            <Title level={5}>{title}</Title>
            {!!subtitle && <StyledSubtitle strong>{subtitle}</StyledSubtitle>}
          </Flex>
          {!!dropdownProps && (
            <Dropdown {...dropdownProps}>
              <Button icon="ChevronDown" type="ghost" />
            </Dropdown>
          )}
          {extraContentLeft}
        </Flex>
      </Flex>
      <Flex alignItems="center">
        {extraContent}
        {optionsDropdownProps && (
          <Flex alignItems="center">
            <SecondaryTopbarDivider />
            <Dropdown {...optionsDropdownProps}>
              <Button icon="EllipsisHorizontal" />
            </Dropdown>
          </Flex>
        )}
      </Flex>
    </StyledContainer>
  );
};

SecondaryTopbar.Divider = SecondaryTopbarDivider;

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  display: flex;
  height: 56px;
  justify-content: space-between;
  padding: 0 12px;
`;

const StyledSubtitle = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;
