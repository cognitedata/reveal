import styles from './app.module.css';
import { Route } from 'react-router-dom';
import styled from 'styled-components/macro';
import { DataGridPage } from './pages/dataGrid/DataGridPage';
import { GraphPage } from './pages/graph/GraphPage';

import '@cognite/cogs.js/dist/cogs.css';

import { Navigation } from './Navigation';
import { Home } from './pages/Home';

export function App() {
  return (
    <StyledAppWrapper className={styles.app}>
      <Navigation />
      <Route path={['/', '/home']} exact component={Home} />
      <Route path="/data-grid" exact component={DataGridPage} />
      <Route path="/graph" exact component={GraphPage} />
    </StyledAppWrapper>
  );
}

export default App;

const StyledAppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
`;
