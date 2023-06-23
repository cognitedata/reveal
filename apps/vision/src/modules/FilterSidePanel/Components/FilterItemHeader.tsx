import React from 'react';

import styled from 'styled-components';

import { ClearButton } from '@vision/modules/Explorer/Components/ClearButton';

import { Body } from '@cognite/cogs.js';

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
