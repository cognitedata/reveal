import React, { useMemo, useState } from 'react';
import { Button, Icon, Input, Tabs, ButtonGroup } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import { useMyCharts, usePublicCharts, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';
import { useLoginStatus } from 'hooks';
import ChartListItem, { ViewOption } from 'components/ChartListItem';

type ActiveTabOption = 'mine' | 'public';

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
  const [viewOption, setViewOption] = useState<ViewOption>('list');

  const { mutate: updateChart } = useUpdateChart();

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
      timeSeriesCollection: [],
      workflowCollection: [],
      dateFrom: dateFrom.toJSON(),
      dateTo: dateTo.toJSON(),
      public: false,
    };
    updateChart({ chart: newChart });
  };

  const nameFilter = (chart: Chart) =>
    chart.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());

  const renderList = () => {
    let filteredCharts = allCharts;

    if (activeTab === 'mine') {
      // Filter to only show charts where the
      // current user is the owner. Remove this
      // filter when firebase security rules are
      // in place
      filteredCharts = myCharts.data || [];
    } else if (activeTab === 'public') {
      filteredCharts = pubCharts.data || [];
    }

    if (filterText) {
      filteredCharts = filteredCharts.filter(nameFilter);
    }

    return filteredCharts.map((chart) => (
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
