import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MyChartsList from '@charts-app/components/ChartList/MyChartsList/MyChartsList';
import PublicChartsList from '@charts-app/components/ChartList/PublicChartsList/PublicChartsList';
import { OpenInCharts } from '@charts-app/components/OpenInCharts/OpenInCharts';
import { currentStartPageLayout } from '@charts-app/config/startPagePreference';
import useCreateChart from '@charts-app/hooks/charts/mutations/useCreateChart';
import { useComponentTranslations } from '@charts-app/hooks/translations';
import { trackUsage } from '@charts-app/services/metrics';
import { createInternalLink } from '@charts-app/utils/link';
import {
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';

import {
  Button,
  Input,
  Tabs,
  SegmentedControl,
  Select,
  Flex,
} from '@cognite/cogs.js';

const defaultTranslations = makeDefaultTranslations(
  'Name',
  'Owner',
  'Updated',
  'Could not load charts',
  'Failed to load Operations',
  'Please reload the page',
  'New charts',
  'Filter charts',
  'My charts',
  'Public charts',
  'Sort by',
  'Preview',
  'New chart'
);

const ChartListPage = () => {
  const move = useNavigate();
  const { mutateAsync: createNewChart, isLoading: isCreatingChart } =
    useCreateChart();
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
  const [viewOption, setViewOption] = useState<'list' | 'grid'>(
    currentStartPageLayout
  );
  const [searchTerm, setSearchTerm] = useState('');
  const t = useComponentTranslations({
    defaultTranslations,
    translationKeys: translationKeys(defaultTranslations),
    translationNamespace: 'ChartList',
  });

  const sortOptions: {
    label: string;
    value: 'updatedAt' | 'name' | 'owner';
    order?: 'asc' | 'desc';
  }[] = [
    { value: 'name' as const, label: t.Name, order: 'asc' },
    { value: 'owner' as const, label: t.Owner },
    { value: 'updatedAt' as const, label: t.Updated },
  ];

  const [sortOption, setSortOption] = useState<(typeof sortOptions)[number]>(
    sortOptions[2]
  );

  useEffect(() => {
    trackUsage('PageView.ChartListPage');
  }, []);

  useEffect(() => {
    trackUsage('ChartListPage.TabChange', { tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    trackUsage('ChartListPage.ViewModeChange', { mode: viewOption });
  }, [viewOption]);

  const handleCreateChart = async () => {
    trackUsage('ChartListPage.CreateChart');
    const id = await createNewChart();
    move(createInternalLink(id));
  };

  const handleSortList = (option: typeof sortOption) => {
    setSortOption(option);
  };

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Flex
      direction="column"
      id="chart-list"
      style={{ padding: 16, width: '100%' }}
    >
      <div style={{ margin: '10px 20px' }}>
        <Button
          type="primary"
          data-testid="new-chart-button"
          icon="Add"
          aria-label={t['New chart']}
          onClick={handleCreateChart}
          disabled={isCreatingChart}
        >
          {t['New chart']}
        </Button>
      </div>
      <div style={{ margin: '10px 20px' }}>
        <Input
          size="large"
          placeholder={t['Filter charts']}
          icon="Search"
          fullWidth
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>
      <Flex style={{ margin: '10px 20px' }}>
        <Tabs
          activeKey={activeTab}
          onTabClick={(activeKey) =>
            setActiveTab(activeKey as typeof activeTab)
          }
        >
          <Tabs.Tab key="mine" tabKey="mine" label={t['My charts']} />
          <Tabs.Tab key="public" tabKey="public" label={t['Public charts']} />
        </Tabs>
        <div style={{ flexGrow: 1 }} />
        <div style={{ width: 200 }}>
          <Select
            title={`${t['Sort by']}:`}
            icon="ArrowDown"
            value={sortOption}
            placeholder={t.Updated}
            onChange={handleSortList}
            options={sortOptions}
          />
        </div>
        <div style={{ marginLeft: 16 }}>
          <SegmentedControl
            currentKey={viewOption}
            onButtonClicked={(key) => setViewOption(key as typeof viewOption)}
          >
            <SegmentedControl.Button key="grid" icon="Grid" aria-label="Grid" />
            <SegmentedControl.Button key="list" icon="List" aria-label="List" />
          </SegmentedControl>
        </div>
      </Flex>
      <Flex style={{ margin: '10px 20px' }}>
        {activeTab === 'mine' ? (
          <MyChartsList
            viewOption={viewOption}
            sortOption={sortOption}
            searchTerm={searchTerm}
          />
        ) : (
          <PublicChartsList
            viewOption={viewOption}
            sortOption={sortOption}
            searchTerm={searchTerm}
          />
        )}
      </Flex>
      <OpenInCharts />
    </Flex>
  );
};

export default ChartListPage;
