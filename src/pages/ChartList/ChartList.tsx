import { Icon } from '@cognite/cogs.js';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chartSelectors } from 'reducers/charts';
import { fetchAllCharts } from 'reducers/charts/api';
import thumb from 'assets/thumb.png';

const ChartList = () => {
  const dispatch = useDispatch();
  const allCharts = useSelector(chartSelectors.selectAll);
  const loadingStatus = useSelector((state) => state.charts.status);

  useEffect(() => {
    dispatch(fetchAllCharts());
  }, []);

  const renderList = () => {
    return allCharts.map((chart) => (
      <div
        key={chart.id}
        style={{
          width: 'calc(25% - 40px)',
          margin: '20px',
          padding: 20,
          border: '1px solid #ccc',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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

  return (
    <div id="chart-list" style={{ padding: 16 }}>
      <div style={{ textAlign: 'center' }}>
        {loadingStatus.status === 'LOADING' && <Icon type="Loading" />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>{renderList()}</div>
    </div>
  );
};

export default ChartList;
