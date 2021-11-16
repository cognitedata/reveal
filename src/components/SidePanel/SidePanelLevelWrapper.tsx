import React, { ChangeEvent, ReactNode } from 'react';

import { Colors, Detail, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

import { SIDE_PANEL_WIDTH } from 'utils/constants';

type SidePanelLevelProps = {
  children: ReactNode;
  header: ReactNode;
  onQueryChange: (newQuery: string) => void;
  query: string;
  searchInputPlaceholder?: string;
};

export const StyledNoItemsWrapper = styled.div`
  background-color: ${Colors['bg-accent']};
  border-radius: 6px;
  margin-bottom: 8px;
  padding: 12px 12px 16px;
`;

export const StyledNoItemsDetail = styled(Detail)`
  color: ${Colors['text-hint']};
  line-height: 16px;
  margin-top: 8px;
`;

const StyledPanelLevel = styled.div`
  border-right: 1px solid ${Colors['border-default']};
  width: ${SIDE_PANEL_WIDTH}px;
`;

const StyledSidePanelLevelHeader = styled.div`
  align-items: center;
  display: flex;
  height: 64px;
  padding: 16px 12px 20px;
`;

const StyledSidePanelLevelContent = styled.div`
  height: calc(100% - 125px);
  overflow-y: auto;
  padding: 0 12px 12px;
`;

const StyledSidePanelLevelSearchInput = styled(Input)`
  border-bottom: 1px solid ${Colors['border-default']};
  margin-bottom: 12px;
  padding: 0 12px 12px;
`;

const SidePanelLevelWrapper = ({
  children,
  header,
  onQueryChange,
  query,
  searchInputPlaceholder,
}: SidePanelLevelProps): JSX.Element => {
  return (
    <StyledPanelLevel>
      <StyledSidePanelLevelHeader>{header}</StyledSidePanelLevelHeader>
      <StyledSidePanelLevelSearchInput
        fullWidth
        icon="Search"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onQueryChange(e.target.value)
        }
        placeholder={searchInputPlaceholder}
        value={query}
      />
      <StyledSidePanelLevelContent>{children}</StyledSidePanelLevelContent>
    </StyledPanelLevel>
  );
};

export default SidePanelLevelWrapper;
