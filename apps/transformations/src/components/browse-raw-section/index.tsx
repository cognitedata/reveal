import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { StyledEmptyStateContainer } from '@transformations/components/inspect-section';
import RawTableSelectionModal from '@transformations/components/raw-table-selection-modal';
import RawPreviewContent from '@transformations/containers/raw-preview-content';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';

import { Body, Button, Colors, Flex } from '@cognite/cogs.js';

const BrowseRawSection = (): JSX.Element => {
  const { t } = useTranslation();

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const { removeTabs, tabs } = useTransformationContext();

  const rawTabs = tabs.filter(({ type }) => type === 'raw');

  const handleCloseAllRawTabs = () => {
    removeTabs(rawTabs.map(({ key }) => key));
  };

  if (rawTabs.length === 0) {
    return (
      <StyledEmptyStateContainer>
        <Body level={3} style={{ color: Colors['text-icon--muted'] }}>
          {t('browse-raw-section-empty-state')}
        </Body>
        <Button
          icon="AddLarge"
          onClick={() => setIsSelectionModalOpen(true)}
          size="small"
          type="ghost-accent"
        >
          {t('view-raw-table')}
        </Button>
        {isSelectionModalOpen && (
          <RawTableSelectionModal
            onCancel={() => setIsSelectionModalOpen(false)}
            visible
          />
        )}
      </StyledEmptyStateContainer>
    );
  }

  return (
    <StyledContainer>
      <Flex alignItems="center" justifyContent="space-between">
        <Button
          icon="AddLarge"
          onClick={() => setIsSelectionModalOpen(true)}
          size="small"
          type="ghost-accent"
        >
          {t('view-raw-table')}
        </Button>
        <Button onClick={handleCloseAllRawTabs} size="small" type="ghost">
          {t('close-all')}
        </Button>
      </Flex>
      <CardsContainer>
        {[...rawTabs].reverse().map((tab) => (
          <RawPreviewContentWithMargin
            key={tab.key}
            // TODO: update types after separating tab categories
            database={(tab as any).database}
            table={(tab as any).table}
          />
        ))}
      </CardsContainer>
      {isSelectionModalOpen && (
        <RawTableSelectionModal
          onCancel={() => setIsSelectionModalOpen(false)}
          visible
        />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex).attrs({ direction: 'column', gap: 12 })`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const CardsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const RawPreviewContentWithMargin = styled(RawPreviewContent)`
  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

export default BrowseRawSection;
