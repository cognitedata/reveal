import React from 'react';
import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ClearButton } from './ClearButton';

export const FilterItemHeader = ({
  headerText,
  disableClear,
  clear,
}: {
  headerText: string;
  disableClear: boolean;
  clear: () => void;
}) => (
  <HeaderContainer>
    <Body level={3} strong>
      {headerText}
    </Body>
    <ClearButton clear={clear} disableClear={disableClear}>
      Clear
    </ClearButton>
  </HeaderContainer>
);

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
