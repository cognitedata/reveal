import { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  Icon,
  Input,
  Tabs,
  SegmentedControl,
  Select,
  Flex,
  Infobox,
} from '@cognite/cogs.js';
import { trackUsage } from 'services/metrics';
import { makeDefaultTranslations } from 'utils/translations';
import { useComponentTranslations } from 'hooks/translations';
import { OpenInCharts } from 'components/OpenInCharts/OpenInCharts';
import useMyChartsList from 'hooks/myCharts/myCharts';
import useFirebaseCreateNewChart from 'hooks/firebase/currentChart/createNewChart';
import { useNavigate } from 'hooks/navigation';
import usePublicChartsList from 'hooks/publicCharts/publicCharts';
import ChartListGrid from 'components/ChartList/ChartListGrid/ChartListGrid';
import ChartListTable from 'components/ChartList/ChartListTable/ChartListTable';
import { useResetRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';

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
  const resetChart = useResetRecoilState(chartAtom);
  const myCharts = useMyChartsList();
  const publicCharts = usePublicChartsList();
  const { createNewChart } = useFirebaseCreateNewChart();
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
  const [viewOption, setViewOption] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const t = useComponentTranslations({
    defaultTranslations,
    translationNamespace: 'ChartList',
  });
  const chartListTableTranslations = useComponentTranslations(ChartListTable);

  const sortOptions = [
    { value: 'name', label: t.Name },
    { value: 'owner', label: t.Owner },
    { value: 'updatedAt', label: t.Updated },
  ];

  const [sortOption, setSortOption] = useState<typeof sortOptions[number]>(
    sortOptions[2]
  );

  useEffect(() => {
    // This is for making the button disappear in the top bar
    resetChart();
  }, [resetChart]);

  useEffect(() => {
    trackUsage('PageView.ChartListPage');
  }, []);

  useEffect(() => {
    trackUsage('ChartListPage.TabChange', { tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    trackUsage('ChartListPage.ViewModeChange', { mode: viewOption });
  }, [viewOption]);

  const handleNewChart = async () => {
    trackUsage('ChartListPage.CreateChart');
    const id = await createNewChart();
    move(`/${id}`);
  };

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicateChart', { chartId });
    if (activeTab === 'mine') {
      const newId = await myCharts.duplicateChart(chartId);
      move(`/${newId}`);
    } else {
      const publicChart = publicCharts.list.find((c) => c.id === chartId);
      if (!publicChart) throw new Error('Public Chart not found');
      const newId = await myCharts.duplicatePublicChart(
        publicChart.firebaseChart
      );
      move(`/${newId}`);
    }
  };

  const handleDelete = (chartId: string) => {
    trackUsage('ChartListPage.DeleteChart');
    if (activeTab === 'mine') myCharts.deleteChart(chartId);
  };

  const seeMyCharts = activeTab === 'mine';

  const handleSortList = (option: typeof sortOption) => {
    const currentSort = seeMyCharts ? myCharts.sortList : publicCharts.sortList;
    setSortOption(option);
    currentSort(option.value as 'updatedAt' | 'name' | 'owner');
  };

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const currentFilter = seeMyCharts
      ? myCharts.filterList
      : publicCharts.filterList;
    currentFilter(e.target.value);
  };

  const currentList = seeMyCharts ? myCharts.list : publicCharts.list;
  const currentLoading = seeMyCharts ? myCharts.loading : publicCharts.loading;
  const currentError = seeMyCharts ? myCharts.error : publicCharts.error;

  return (
    <Flex
      direction="column"
      id="chart-list"
      style={{ padding: 16, width: '100%' }}
    >
      {currentError && (
        <Infobox
          type="warning"
          title="There was a problem when loading the information"
        >
          {currentError}
        </Infobox>
      )}
      <div style={{ margin: '10px 20px' }}>
        <Button
          type="primary"
          icon="Add"
          aria-label={t['New chart']}
          onClick={handleNewChart}
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
        {viewOption === 'list' ? (
          <ChartListTable
            loading={currentLoading}
            list={currentList}
            onChartClick={(chartId) => move(`/${chartId}`)}
            translations={chartListTableTranslations}
            onChartDeleteClick={handleDelete}
            onChartDuplicateClick={handleDuplicate}
            readOnly={activeTab === 'public'}
          />
        ) : (
          <ChartListGrid
            loading={currentLoading}
            list={currentList}
            onChartClick={(chartId) => move(`/${chartId}`)}
            onChartDeleteClick={handleDelete}
            onChartDuplicateClick={handleDuplicate}
            readOnly={activeTab === 'public'}
            translations={chartListTableTranslations}
          />
        )}
      </Flex>
      <OpenInCharts />
    </Flex>
  );
};

export default ChartListPage;
