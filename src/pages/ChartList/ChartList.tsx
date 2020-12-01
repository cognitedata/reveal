import { Icon } from '@cognite/cogs.js';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chartSelectors } from 'reducers/charts';
import { fetchAllCharts } from 'reducers/charts/api';

const ChartList = () => {
  const dispatch = useDispatch();
  const allCharts = useSelector(chartSelectors.selectAll);
  const loadingStatus = useSelector((state) => state.charts.status);

  useEffect(() => {
    dispatch(fetchAllCharts());
  }, []);

  const renderList = () => {
    return allCharts.map((chart) => (
      <div key={chart.id}>
        <Link to={`/${chart.id}`} key={chart.id}>
          {chart.name}
        </Link>
      </div>
    ));
  };

  return (
    <div id="chart-list" style={{ padding: 16 }}>
      Hello to all your charts!
      <div>{loadingStatus.status === 'LOADING' && <Icon type="Loading" />}</div>
      <div>{renderList()}</div>
    </div>
  );
};

export default ChartList;
