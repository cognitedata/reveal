import styles from './app.module.css';
import { Route, Link } from 'react-router-dom';
import { DataGridPage } from './pages/dataGrid/DataGridPage';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { GraphPage } from './pages/graph/GraphPage';

import '@cognite/graph';
import { enableGraphElement } from '@cognite/graph';

enableGraphElement();

export function App() {
  return (
    <div className={styles.app}>
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
          <li>
            <Link to="/data-grid">Data Grid</Link>
          </li>
          <li>
            <Link to="/graph">Graph</Link>
          </li>
        </ul>
      </div>
      <Route
        path="/"
        exact
        render={() => (
          <div>
            This is the generated root route.{' '}
            <Link to="/page-2">Click here for page 2.</Link>
          </div>
        )}
      />
      <Route path="/data-grid" exact component={DataGridPage} />
      <Route path="/graph" exact component={GraphPage} />
      <Route
        path="/page-2"
        exact
        render={() => (
          <div>
            <Link to="/">Click here to go back to root page.</Link>
          </div>
        )}
      />
      {/* END: routes */}
    </div>
  );
}

export default App;
