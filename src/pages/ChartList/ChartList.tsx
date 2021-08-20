import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Icon,
  Input,
  Tabs,
  SegmentedControl,
  Select,
} from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import { useMyCharts, usePublicCharts, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';
import { useNavigate } from 'hooks';
import ChartListItem, { ViewOption } from 'components/ChartListItem';
import { OpenInCharts } from 'components/OpenInCharts';
import { CHART_VERSION } from 'config/';
import { trackUsage } from 'utils/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useResetRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';

type ActiveTabOption = 'mine' | 'public';
type SortOption = 'name' | 'owner' | 'updatedAt';
type SelectSortOption = { value: SortOption; label: string };

const nameSorter = (a: Chart, b: Chart) => {
  return a.name.localeCompare(b.name);
};

const ownerSorter = (a: Chart, b: Chart) => {
  return a.user.localeCompare(b.user);
};

const updatedAtSorter = (a: Chart, b: Chart) => {
  if (!a.updatedAt && !b.updatedAt) return 0;
  if (!a.updatedAt) return 1;
  if (!b.updatedAt) return -1;
  return b.updatedAt - a.updatedAt;
};

const sortOptions: SelectSortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'owner', label: 'Owner' },
  { value: 'updatedAt', label: 'Updated' },
];

const ChartList = () => {
  const move = useNavigate();
  const { data: login } = useUserInfo();
  const myCharts = useMyCharts();
  const pubCharts = usePublicCharts();
  const resetChart = useResetRecoilState(chartState);

  useEffect(() => {
    resetChart();
  }, [resetChart]);

  const allCharts = useMemo(() => {
    const mine = myCharts.data || [];
    const pub = pubCharts.data || [];

    return pub.concat(mine.filter((c) => !pub.find((pc) => c.id === pc.id)));
  }, [myCharts.data, pubCharts.data]);

  const loading =
    (myCharts.isFetching && !myCharts.isFetched) ||
    (pubCharts.isFetching && !pubCharts.isFetched);
  const error = myCharts.isError || pubCharts.isError;

  const [filterText, setFilterText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTabOption>('mine');
  const [sortOption, setSortOption] = useState<SortOption>('updatedAt');
  const [viewOption, setViewOption] = useState<ViewOption>('list');

  useEffect(() => {
    trackUsage('PageView.ChartList');
  }, []);

  useEffect(() => {
    trackUsage('ChartList.TabChange', { tab: activeTab });
  }, [activeTab]);

  const { mutateAsync: updateChart } = useUpdateChart();

  const handleNewChart = async () => {
    if (!login?.id) {
      return;
    }
    const dateFrom = subDays(new Date(), 30);
    dateFrom.setHours(0, 0);
    const dateTo = new Date();
    dateTo.setHours(23, 59);
    const id = nanoid();
    const newChart: Chart = {
      id,
      user: login?.id,
      userInfo: login,
      name: 'New chart',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timeSeriesCollection: [],
      workflowCollection: [],
      dateFrom: dateFrom.toJSON(),
      dateTo: dateTo.toJSON(),
      public: false,
      version: CHART_VERSION,
      settings: {
        showYAxis: true,
        showMinMax: false,
        showGridlines: true,
        mergeUnits: false,
      },
    };
    await updateChart(newChart);

    trackUsage('ChartList.CreateChart');
    move(`/${id}`);
  };

  const nameFilter = (chart: Chart) =>
    chart.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());

  const renderList = () => {
    let chartsToRender = allCharts;

    if (activeTab === 'mine') {
      // Filter to only show charts where the
      // current user is the owner. Remove this
      // filter when firebase security rules are
      // in place
      chartsToRender = myCharts.data || [];
    } else if (activeTab === 'public') {
      chartsToRender = pubCharts.data || [];
    }

    if (filterText) {
      chartsToRender = chartsToRender.filter(nameFilter);
    }

    if (sortOption === 'name') {
      chartsToRender.sort(nameSorter);
    } else if (sortOption === 'owner') {
      chartsToRender.sort(ownerSorter);
    } else {
      chartsToRender.sort(updatedAtSorter);
    }

    return chartsToRender.map((chart) => (
      <ChartListItem key={chart.id} chart={chart} view={viewOption} />
    ));
  };

  const renderError = () => {
    return (
      <div>
        <p>Could not load charts</p>
        <pre>{`${myCharts.error || pubCharts.error}`}</pre>
      </div>
    );
  };

  return (
    <div id="chart-list" style={{ padding: 16, width: '100%' }}>
      <div style={{ margin: 20 }}>
        <Button type="primary" icon="PlusCompact" onClick={handleNewChart}>
          New chart
        </Button>
      </div>
      <div style={{ margin: 20 }}>
        <Input
          size="large"
          placeholder="Filter charts"
          icon="Search"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div
        style={{ margin: 20, display: 'flex', justifyContent: 'space-between' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey as ActiveTabOption)}
        >
          <Tabs.TabPane key="mine" tab={<span>My charts</span>} />
          <Tabs.TabPane key="public" tab={<span>Public charts</span>} />
        </Tabs>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 200 }}>
            {/* @ts-ignore next line */}
            <Select
              title="Sort by:"
              icon="ArrowDown"
              /*
                Hack below: Cogs.js has a bug where passing the value makes it
                always show the placeholder. So, I'm not passing the value and
                setting the placeholder to the default option. This will have
                the desired behavior, given the bug. It's not fixed in the
                latest version of Cogs yet.
              */
              // value={sortOption}
              placeholder="Updated"
              onChange={(option: SelectSortOption) =>
                setSortOption(option.value)
              }
              options={sortOptions}
            />
          </div>
          <div style={{ marginLeft: 16 }}>
            <SegmentedControl
              currentKey={viewOption}
              onButtonClicked={(key) => setViewOption(key as ViewOption)}
            >
              <SegmentedControl.Button key="grid">
                <Icon type="Grid" />
              </SegmentedControl.Button>
              <SegmentedControl.Button key="list">
                <Icon type="List" />
              </SegmentedControl.Button>
            </SegmentedControl>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        {loading && <Icon type="Loading" />}
      </div>
      {viewOption === 'list' && (
        <ListHeader>
          <div style={{ width: 120 }}>Preview</div>
          <div style={{ width: '40%', marginLeft: 16 }}>Name</div>
          <div style={{ flexGrow: 1 }}>Owner</div>
          <div style={{ width: 127 }}>Updated</div>
        </ListHeader>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {error ? renderError() : renderList()}
      </div>
      <OpenInCharts />
    </div>
  );
};

const ListHeader = styled.div`
  display: flex;
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  text-transform: uppercase;
  margin: 0 20px 10px 20px;
  padding: 0 16px;
`;

export default ChartList;
