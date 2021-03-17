import React, { useMemo, useState } from 'react';
import {
  Button,
  Icon,
  Input,
  Tabs,
  ButtonGroup,
  Select,
} from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import { useMyCharts, usePublicCharts, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';
import { useLoginStatus } from 'hooks';
import ChartListItem, { ViewOption } from 'components/ChartListItem';
import { CHART_VERSION } from 'config/';
import { useHistory } from 'react-router-dom';

type ActiveTabOption = 'mine' | 'public';
type SortOption = 'name' | 'owner';
type SelectSortOption = { value: SortOption; label: string };

const nameSorter = (a: Chart, b: Chart) => {
  return a.name.localeCompare(b.name);
};

const ownerSorter = (a: Chart, b: Chart) => {
  return a.user.localeCompare(b.user);
};

const sortOptions: SelectSortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'owner', label: 'Owner' },
];

const ChartList = () => {
  const { data: login } = useLoginStatus();
  const myCharts = useMyCharts();
  const pubCharts = usePublicCharts();

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
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [viewOption, setViewOption] = useState<ViewOption>('list');

  const { mutateAsync: updateChart } = useUpdateChart();

  const history = useHistory();
  const handleNewChart = async () => {
    if (!login?.user) {
      return;
    }
    const dateFrom = subDays(new Date(), 30);
    dateFrom.setHours(0, 0);
    const dateTo = new Date();
    dateTo.setHours(23, 59);
    const id = nanoid();
    const newChart: Chart = {
      id,
      user: login?.user,
      name: 'New chart',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timeSeriesCollection: [],
      workflowCollection: [],
      dateFrom: dateFrom.toJSON(),
      dateTo: dateTo.toJSON(),
      public: false,
      version: CHART_VERSION,
    };
    await updateChart({ chart: newChart });
    history.push(`/${id}`);
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
    } else {
      chartsToRender.sort(ownerSorter);
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
        <Button type="primary" icon="Plus" onClick={handleNewChart}>
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
              placeholder="Name"
              onChange={(option: SelectSortOption) =>
                setSortOption(option.value)
              }
              options={sortOptions}
            />
          </div>
          <div style={{ marginLeft: 16 }}>
            <ButtonGroup
              currentKey={viewOption}
              onButtonClicked={(key) => setViewOption(key as ViewOption)}
            >
              <ButtonGroup.Button key="grid">
                <Icon type="Grid" />
              </ButtonGroup.Button>
              <ButtonGroup.Button key="list">
                <Icon type="List" />
              </ButtonGroup.Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        {loading && <Icon type="Loading" />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {error ? renderError() : renderList()}
      </div>
    </div>
  );
};

export default ChartList;
