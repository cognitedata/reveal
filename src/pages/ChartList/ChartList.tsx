import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart, chartSelectors } from 'reducers/charts';
import { fetchAllCharts, renameChart, deleteChart } from 'reducers/charts/api';
import thumb from 'assets/thumb.png';

const ChartList = () => {
  const dispatch = useDispatch();
  const allCharts = useSelector(chartSelectors.selectAll);
  const loadingStatus = useSelector((state) => state.charts.status);
  const error = useSelector((state) => state.charts.status.error);

  useEffect(() => {
    dispatch(fetchAllCharts());
  }, []);

  const handleRenameChart = (chart: Chart) => {
    dispatch(renameChart(chart));
  };

  const handleDeleteChart = (chart: Chart) => {
    dispatch(deleteChart(chart));
  };

  const renderList = () => {
    return allCharts.map((chart) => (
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
                  <span>Rename workspace</span>
                </Menu.Item>
                <Menu.Item
                  onClick={() => handleDeleteChart(chart)}
                  appendIcon="Delete"
                >
                  <span>Delete workspace</span>
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
    <div id="chart-list" style={{ padding: 16 }}>
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
