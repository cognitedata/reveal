import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Icon, Input, Tabs } from '@cognite/cogs.js';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import { useHistory } from 'react-router-dom';
import { Chart, chartSelectors } from 'reducers/charts';
import { selectUser } from 'reducers/environment';
import { fetchAllCharts, createNewChart } from 'reducers/charts/api';
import ChartListItem, { ViewOption } from 'components/ChartListItem';

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
  const [viewOption, setViewOption] = useState<ViewOption>('list');

  useEffect(() => {
    dispatch(fetchAllCharts());
  }, []);

  useEffect(() => {
    if (newlyCreatedChart) {
      history.push(`/${newlyCreatedChart.id}`);
    }
  }, [newlyCreatedChart]);

  const handleNewChart = async () => {
    dispatch(createNewChart());
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
      <ChartListItem key={chart.id} chart={chart} view={viewOption} />
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
        {loadingStatus.status === 'LOADING' && <Icon type="Loading" />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {error ? renderError() : renderList()}
      </div>
    </div>
  );
};

export default ChartList;
