import { ChangeEvent, ReactNode, useContext } from 'react';

import { Button, Colors, Detail, Flex, Input, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { RawExplorerContext } from 'contexts';

type SidePanelLevelWrapperProps = {
  children: ReactNode;
  openCreateModal: () => void;
  onQueryChange: (newQuery: string) => void;
  query: string;
  searchInputPlaceholder?: string;
  selectedSidePanelDatabase?: string;
};

const SidePanelLevelWrapper = ({
  children,
  onQueryChange,
  openCreateModal,
  query,
  searchInputPlaceholder,
  selectedSidePanelDatabase,
}: SidePanelLevelWrapperProps): JSX.Element => {
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  return (
    <StyledPanelLevel>
      <StyledSidePanelLevelHeader>
        {!!selectedSidePanelDatabase && (
          <StyledSidePanelLevelHeaderRow>
            <Button
              icon="ArrowLeft"
              onClick={() => setSelectedSidePanelDatabase(undefined)}
              size="small"
              type="ghost"
            />
            <Title level={5}>{selectedSidePanelDatabase}</Title>
          </StyledSidePanelLevelHeaderRow>
        )}
        <StyledSidePanelLevelHeaderRow>
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onQueryChange(e.target.value)
            }
            placeholder={searchInputPlaceholder}
            size="small"
            value={query}
            icon="Search"
            fullWidth
          />
          <Button icon="AddLarge" onClick={openCreateModal} size="small" />
        </StyledSidePanelLevelHeaderRow>
      </StyledSidePanelLevelHeader>
      <StyledSidePanelLevelContent>{children}</StyledSidePanelLevelContent>
    </StyledPanelLevel>
  );
};

const StyledPanelLevel = styled.div`
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const StyledSidePanelLevelContent = styled.div`
  padding: 0 12px 12px;
`;

const StyledSidePanelLevelHeader = styled.div`
  background: white;
  position: sticky;
  top: 0;
  left: 0;
  padding: 12px;
`;

const StyledSidePanelLevelHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const StyledRawSidePanelContentLoader = styled(Flex)`
  height: 200px;
`;

export const StyledHeaderActionDivider = styled.div`
  background-color: ${Colors['bg-control--disabled']};
  height: 16px;
  margin: 0 8px;
  width: 2px;
`;

export const StyledEmptyListWrapper = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent'].hex()};
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 36px 48px;
`;

export const StyledEmptyListTitle = styled(Title)`
  color: ${Colors['text-primary'].hex()};
`;

export const StyledEmptyListDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  margin: 8px 0 16px;
  text-align: center;
`;

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

export default SidePanelLevelWrapper;
