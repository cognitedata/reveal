import {
  Button,
  SegmentedControl,
  SegmentedControlProps,
  Tooltip,
} from '@cognite/cogs.js';
import {
  getTranslationsForComponent,
  makeDefaultTranslations,
  translationKeys,
} from 'utils/translations';
import {
  Sidebar,
  ContentOverflowWrapper,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import MetadataPanel from 'components/MetadataPanel/MetadataPanel';
import { ComponentProps } from 'react';
import { Container } from '../Common/SidebarElements';
import StatisticsPanel from '../StatisticsPanel/StatisticsPanel';
import DetailsSidebarSourceHeader from './DetailsSidebarSourceHeader';

const defaultTranslations = makeDefaultTranslations(
  'Details',
  'Hide',
  'Statistics',
  'Metadata',
  'Time series',
  'Calculation',
  ...MetadataPanel.translationKeys,
  ...StatisticsPanel.translationKeys
);

type Props = {
  onClose: () => void;
  visible?: boolean;
  selectedPanel: 'statistics' | 'metadata';
  source: {
    name: string;
    color: string;
    type: 'timeseries' | 'calculation';
    statistics: Omit<ComponentProps<typeof StatisticsPanel>, 'translations'>;
    metadata: Omit<ComponentProps<typeof MetadataPanel>, 'translations'>;
  };
  onChangeSelectedPanel: (newPanel: 'statistics' | 'metadata') => void;
  translations?: typeof defaultTranslations;
};

const DetailsSidebar = ({
  onClose,
  selectedPanel,
  onChangeSelectedPanel,
  translations,
  source,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <Sidebar>
      <TopContainer>
        <TopContainerTitle>{t.Details}</TopContainerTitle>
        <TopContainerAside>
          <SegmentedControl
            currentKey={selectedPanel}
            onButtonClicked={
              onChangeSelectedPanel as SegmentedControlProps['onButtonClicked']
            }
            controlled
          >
            <SegmentedControl.Button key="statistics">
              {t.Statistics}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="metadata">
              {t.Metadata}
            </SegmentedControl.Button>
          </SegmentedControl>
          <Tooltip content={t.Hide}>
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="Close Panel"
            />
          </Tooltip>
        </TopContainerAside>
      </TopContainer>
      <ContentOverflowWrapper>
        <Container>
          <DetailsSidebarSourceHeader
            isTimeSeries={source.type === 'timeseries'}
            title={
              source.type === 'timeseries' ? t['Time series'] : t.Calculation
            }
            color={source.color}
            name={source.name}
          />
          {selectedPanel === 'metadata' && (
            <MetadataPanel
              {...source.metadata}
              translations={getTranslationsForComponent(t, MetadataPanel)}
            />
          )}
          {selectedPanel === 'statistics' && (
            <StatisticsPanel
              {...source.statistics}
              translations={getTranslationsForComponent(t, StatisticsPanel)}
            />
          )}
        </Container>
      </ContentOverflowWrapper>
    </Sidebar>
  );
};

DetailsSidebar.defaultTranslations = defaultTranslations;
DetailsSidebar.translationKeys = translationKeys(defaultTranslations);
DetailsSidebar.translationNamespace = 'DetailsSidebar';

export default DetailsSidebar;
