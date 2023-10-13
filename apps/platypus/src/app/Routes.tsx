import React, { useEffect } from 'react';
import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  BrowserRouter,
} from 'react-router-dom';

import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';
import { Copilot, FusionQAFlow, useCopilotContext } from '@fusion/copilot-core';
import noop from 'lodash/noop';

import { getProject } from '@cognite/cdf-utilities';

import { getCogniteSDKClient } from '../environments/cogniteSdk';
import { useFlag } from '../environments/useFlag';

import { Spinner } from './components/Spinner/Spinner';
import { getContainer } from './GlobalStyles';
import { useFusionQuery } from './hooks/useFusionQuery';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import zIndex from './utils/zIndex';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

const DataModelSubRoutes = () => (
  <ReactRoutes>
    <Route>
      <Route index element={<DataModelsPage />} />
      <Route
        path=":space/:dataModelExternalId/:version/*"
        element={
          <ReactRoutes>
            <Route
              path="/*"
              element={
                <React.Suspense fallback={<Spinner />}>
                  <DataModel />
                </React.Suspense>
              }
            />
          </ReactRoutes>
        }
      ></Route>
    </Route>
  </ReactRoutes>
);

interface RoutesWrapperProps {
  children: React.ReactNode;
}
const RoutesWrapper = ({ children }: RoutesWrapperProps) => {
  useFusionQuery();
  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallbackForTest: false,
    fallback: false,
  });

  const { registerFlow } = useCopilotContext();

  useEffect(() => {
    if (isEnabled) {
      const unmount = registerFlow({
        flow: new FusionQAFlow({ sdk: getCogniteSDKClient() }),
      });
      return () => unmount();
    }
    return noop;
  }, [registerFlow, isEnabled]);
  useEffect(() => {
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add(DRAG_DROP_PORTAL_CLASS);
    dragDropPortal.style.zIndex = `${zIndex.MAXIMUM}`;
    dragDropPortal.style.position = 'absolute';
    (getContainer() || document.body).appendChild(dragDropPortal);
  }, []);
  return <>{children}</>;
};

const Routes = () => {
  const tenant = getProject();
  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallbackForTest: false,
    fallback: false,
  });

  const contents = (
    <BrowserRouter
      basename={tenant}
      window={window}
      children={
        <RoutesWrapper>
          <React.Suspense fallback={<Spinner />}>
            <ReactRoutes>
              <Route path="/" element={<Outlet />}>
                <Route index element={<DataModelsPage />} />
                <Route path="data-models/*" element={<DataModelSubRoutes />} />
              </Route>
            </ReactRoutes>
          </React.Suspense>
        </RoutesWrapper>
      }
    />
  );

  if (isEnabled) {
    return <Copilot sdk={getCogniteSDKClient()}>{contents}</Copilot>;
  }

  return contents;
};

export default Routes;
