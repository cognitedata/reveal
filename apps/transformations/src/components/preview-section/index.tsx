import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { StyledEmptyStateContainer } from '@transformations/components/inspect-section';
import QueryPreviewCard from '@transformations/components/query-preview-card';
import {
  PreviewTab,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';

import { Body, Button, Colors, Flex } from '@cognite/cogs.js';

type PreviewSectionProps = {
  transformation: TransformationRead;
};

const PreviewSection = ({
  transformation,
}: PreviewSectionProps): JSX.Element => {
  const { t } = useTranslation();

  const { removeTabs, tabs } = useTransformationContext();

  const previewTabs = tabs.filter(
    ({ type }) => type === 'preview'
  ) as PreviewTab[];

  const handleCloseAllPreviewTabs = () => {
    removeTabs(previewTabs.map(({ key }) => key));
  };

  if (previewTabs.length === 0) {
    return (
      <StyledEmptyStateContainer>
        <Body level={3} style={{ color: Colors['text-icon--muted'] }}>
          {t('preview-section-empty-state')}
        </Body>
      </StyledEmptyStateContainer>
    );
  }

  return (
    <StyledContainer>
      <Flex alignItems="center" justifyContent="space-between">
        <Body level={3} style={{ color: Colors['text-icon--muted'] }}>
          {t('preview-results-with-count', { count: previewTabs.length })}
        </Body>
        <Button onClick={handleCloseAllPreviewTabs} size="small" type="ghost">
          {t('close-all')}
        </Button>
      </Flex>
      <CardsContainer>
        {[...previewTabs].reverse().map((tab) => (
          <QueryPreviewCardWithMargin
            key={tab.key}
            tab={tab as PreviewTab}
            transformation={transformation}
          />
        ))}
      </CardsContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  overflow: auto;
  width: 100%;
`;

const CardsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const QueryPreviewCardWithMargin = styled(QueryPreviewCard)`
  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

export default PreviewSection;
