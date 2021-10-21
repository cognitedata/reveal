import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Logout } from '@cognite/react-container';
import ModelLibrary from 'pages/ModelLibrary';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import NewModel from 'pages/ModelLibrary/NewModel';
import { useDispatch, useSelector } from 'react-redux';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { fetchGroups } from 'store/group/thunks';
import { Loader } from '@cognite/cogs.js';
import { fetchDatasets } from 'store/dataset/thunks';
import { selectIsAppInitialized } from 'store/selectors';
import NewVersion from 'pages/ModelLibrary/NewVersion';

export default function App() {
  const dispatch = useDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const isAppInitialized = useSelector(selectIsAppInitialized);

  useEffect(() => {
    dispatch(fetchGroups(cdfClient));
    dispatch(fetchDatasets(cdfClient));
  }, []);

  if (!isAppInitialized) {
    return <Loader />;
  }

  return (
    <>
      <GlobalStyles />
      <MenuBar />
      <Switch>
        <Route exact path={PAGES.MODEL_LIBRARY} component={ModelLibrary} />
        <Route path={PAGES.MODEL_LIBRARY_NEW} component={NewModel} />
        <Route
          exact
          path={PAGES.MODEL_LIBRARY_VERSION}
          component={ModelLibrary}
        />
        <Route
          exact
          path={PAGES.MODEL_LIBRARY_VERSION_NEW}
          component={NewVersion}
        />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />
        <Redirect from="" to={PAGES.MODEL_LIBRARY} />
        <Redirect from="/" to={PAGES.MODEL_LIBRARY} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  );
}
