import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Input, Menu, Tabs } from '@cognite/cogs.js';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import { Link, useHistory } from 'react-router-dom';
import { Chart, chartSelectors } from 'reducers/charts';
import { selectUser } from 'reducers/environment';
import {
  fetchAllCharts,
  renameChart,
  deleteChart,
  createNewChart,
  duplicateChart,
} from 'reducers/charts/api';
import thumb from 'assets/thumb.png';

type ActiveTabOption = 'mine' | 'public';

const ChartList = () => {
  const dispatch = useDispatch();
  const allCharts = useSelector(chartSelectors.selectAll);
  const loadingStatus = useSelector((state) => state.charts.status);
  const error = useSelector((state) => state.charts.status.error);
  const newlyCreatedChart = useSelector(
    (state) => state.charts.newlyCreatedChart
  );
  const history = useHistory();
  const user = useSelector(selectUser);

  const [filterText, setFilterText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTabOption>('mine');

  useEffect(() => {
    dispatch(fetchAllCharts());
  }, []);

  useEffect(() => {
    if (newlyCreatedChart) {
      history.push(`/${newlyCreatedChart.id}`);
    }
  }, [newlyCreatedChart]);

  const handleRenameChart = (chart: Chart) => {
    dispatch(renameChart(chart));
  };

  const handleDeleteChart = (chart: Chart) => {
    dispatch(deleteChart(chart));
  };

  const handleNewChart = async () => {
    dispatch(createNewChart());
  };

  const handleDuplicateChart = (chart: Chart) => {
    dispatch(duplicateChart(chart));
  };

  const ownerFilter = (chart: Chart) => chart.user === user.email;

  const publicFilter = (chart: Chart) => chart.public === true;

  const nameFilter = (chart: Chart) =>
    chart.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());

  const renderList = () => {
    let filteredCharts = allCharts;

    if (activeTab === 'mine') {
      // Filter to only show charts where the
      // current user is the owner. Remove this
      // filter when firebase security rules are
      // in place
      filteredCharts = filteredCharts.filter(ownerFilter);
    } else if (activeTab === 'public') {
      filteredCharts = filteredCharts.filter(publicFilter);
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
        <pre>{error?.message}</pre>
        <pre>{error?.stack}</pre>
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
        {loadingStatus.status === 'LOADING' && <Icon type="Loading" />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {error ? renderError() : renderList()}
      </div>
    </div>
  );
};

export default ChartList;
