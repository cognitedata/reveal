import styled from 'styled-components';

import {
  EDITOR_VIEW_COLUMN_GAP,
  useTranslation,
} from '@transformations/common';
import BrowseRawSection from '@transformations/components/browse-raw-section';
import PageLayoutButton from '@transformations/components/page-direction-button';
import PreviewSection from '@transformations/components/preview-section';
import RunHistorySection from '@transformations/components/run-history-section';
import {
  InspectSectionKey,
  PageDirection,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';
import { StyledSectionHeader } from '@transformations/pages/transformation-details/TransformationDetailsContent';
import { TransformationRead } from '@transformations/types';
import { Tabs } from 'antd';

import { Button, Colors, Elevations, Flex } from '@cognite/cogs.js';

const INSPECT_PANELS: {
  key: InspectSectionKey;
}[] = [
  {
    key: 'browse-source',
  },
  {
    key: 'preview',
  },
  {
    key: 'run-history',
  },
];

type InspectSectionProps = {
  transformation: TransformationRead;
};

const InspectSection = ({
  transformation,
}: InspectSectionProps): JSX.Element => {
  const { t } = useTranslation();

  const { activeInspectSectionKey, setActiveInspectSectionKey, pageDirection } =
    useTransformationContext();

  const renderSection = (key: InspectSectionKey) => {
    switch (key) {
      case 'browse-source':
        return <BrowseRawSection />;
      case 'preview':
        return <PreviewSection transformation={transformation} />;
      case 'run-history':
        return <RunHistorySection transformation={transformation} />;
    }
  };

  return (
    <StyledContainer $direction={pageDirection}>
      <StyledSection>
        <StyledSectionHeader>
          <Flex gap={8}>
            {INSPECT_PANELS.map(({ key }) => (
              <Button
                key={key}
                onClick={() => setActiveInspectSectionKey(key)}
                size="small"
                toggled={activeInspectSectionKey === key}
                type="ghost-accent"
              >
                {t(`inspect-panel-title-${key}`)}
              </Button>
            ))}
          </Flex>
          <PageLayoutButton />
        </StyledSectionHeader>
        <StyledContent>
          <StyledTabs activeKey={activeInspectSectionKey}>
            {INSPECT_PANELS.map(({ key }) => (
              <Tabs.TabPane key={key}>{renderSection(key)}</Tabs.TabPane>
            ))}
          </StyledTabs>
        </StyledContent>
      </StyledSection>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{
  $direction: PageDirection;
}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ $direction }) =>
    $direction === 'vertical' ? '8px 12px 12px' : '12px 12px 12px 8px'};
`;

const StyledSection = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledContent = styled.div`
  display: flex;
  padding: ${EDITOR_VIEW_COLUMN_GAP}px;
  flex: 1;
  overflow: auto;
`;

const StyledTabs = styled(Tabs)`
  width: 100%;

  .ant-tabs-nav {
    display: none;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
  }
`;

export const StyledEmptyStateContainer = styled(Flex).attrs({
  alignItems: 'center',
  direction: 'column',
  gap: 8,
  justifyContent: 'center',
})`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  height: 100%;
  padding: 72px;
  width: 100%;
`;

export default InspectSection;
