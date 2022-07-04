import { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  Icon,
  Input,
  Tabs,
  SegmentedControl,
  Select,
  Flex,
} from '@cognite/cogs.js';
import { trackUsage } from 'services/metrics';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { useComponentTranslations } from 'hooks/translations';
import { OpenInCharts } from 'components/OpenInCharts/OpenInCharts';
import useCreateChart from 'models/charts/charts/mutations/useCreateChart';
import { useNavigate } from 'hooks/navigation';
import MyChartsList from 'components/ChartList/MyChartsList/MyChartsList';
import PublicChartsList from 'components/ChartList/PublicChartsList/PublicChartsList';
import UserPreferences from 'models/charts/user-preferences/classes/UserPreferences';

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
    UserPreferences.startPageLayout
  );
  const [searchTerm, setSearchTerm] = useState('');
  const t = useComponentTranslations({
    defaultTranslations,
    translationKeys: translationKeys(defaultTranslations),
    translationNamespace: 'ChartList',
  });

  const sortOptions = [
    { value: 'name' as const, label: t.Name },
    { value: 'owner' as const, label: t.Owner },
    { value: 'updatedAt' as const, label: t.Updated },
  ];

  const [sortOption, setSortOption] = useState<typeof sortOptions[number]>(
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
    move(`/${id}`);
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
          onChange={(activeKey) => setActiveTab(activeKey as typeof activeTab)}
        >
          <Tabs.TabPane key="mine" tab={<span>{t['My charts']}</span>} />
          <Tabs.TabPane key="public" tab={<span>{t['Public charts']}</span>} />
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
            <SegmentedControl.Button key="grid">
              <Icon type="Grid" />
            </SegmentedControl.Button>
            <SegmentedControl.Button key="list">
              <Icon type="List" />
            </SegmentedControl.Button>
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
