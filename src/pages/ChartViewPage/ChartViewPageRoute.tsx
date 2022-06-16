import FileViewPage from 'pages/FileViewPage/FileViewPage';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import ChartViewPage from './ChartViewPage';

const ChartViewPageRoute = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} component={ChartViewPage} />
      <Route path={`${path}/files/:assetId`} component={FileViewPage} />
    </Switch>
  );
};

export default ChartViewPageRoute;
