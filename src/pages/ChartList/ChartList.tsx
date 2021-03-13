import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Icon, Input, Menu, Tabs } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';
import { Chart } from 'reducers/charts/types';
import thumb from 'assets/thumb.png';
import {
  useDeleteChart,
  useMyCharts,
  usePublicCharts,
  useUpdateChart,
} from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';
import { useLoginStatus } from 'hooks';

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

  const { mutate: updateChart } = useUpdateChart();
  const { mutate: deleteChart } = useDeleteChart();

  const handleRenameChart = (chart: Chart) => {
    // eslint-disable-next-line no-alert
    const name = prompt('Rename chart', chart.name) || chart.name;
    updateChart({ chart: { ...chart, name } });
  };

  const handleDeleteChart = (chart: Chart) => {
    deleteChart(chart.id);
  };

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

  const handleDuplicateChart = (chart: Chart) => {
    const id = nanoid();
    const newChart = {
      ...chart,
      name: `${chart.name} Copy`,
      id,
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
      <div
        key={chart.id}
        style={{
          width: 'calc(25% - 40px)',
          margin: '20px',
          padding: 20,
          paddingTop: 80,
          border: '1px solid #ccc',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 50,
            backgroundColor: '#ccc',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown
            content={
              <Menu>
                <Menu.Header>
                  <span style={{ wordBreak: 'break-word' }}>{chart.name}</span>
                </Menu.Header>
                <Menu.Item
                  onClick={() => handleRenameChart(chart)}
                  appendIcon="Edit"
                >
                  <span>Rename</span>
                </Menu.Item>
                <Menu.Item
                  onClick={() => handleDeleteChart(chart)}
                  appendIcon="Delete"
                >
                  <span>Delete</span>
                </Menu.Item>
                <Menu.Item
                  onClick={() => handleDuplicateChart(chart)}
                  appendIcon="Duplicate"
                >
                  <span>Duplicate</span>
                </Menu.Item>
              </Menu>
            }
          >
            <div style={{ display: 'flex', padding: 10 }}>
              <Icon type="VerticalEllipsis" />
            </div>
          </Dropdown>
        </div>
        <Link to={`/${chart.id}`} key={chart.id}>
          <div style={{ width: '100%' }}>
            <img
              style={{
                width: 'calc(100% - 20px)',
                margin: 10,
                border: '1px solid #ddd',
              }}
              src={thumb}
              alt={chart.name}
            />
          </div>
          <h3 style={{ textAlign: 'center' }}>{chart.name}</h3>
        </Link>
      </div>
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
          placeholder="Filter charts"
          icon="Search"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div style={{ margin: 20 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey as ActiveTabOption)}
        >
          <Tabs.TabPane key="mine" tab={<span>My charts</span>} />
          <Tabs.TabPane key="public" tab={<span>Public charts</span>} />
        </Tabs>
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
