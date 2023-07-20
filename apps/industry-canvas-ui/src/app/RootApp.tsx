import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@data-exploration/components';
import {
  IndustryCanvasHomePage,
  IndustryCanvasPage,
  UserProfileProvider,
  SpaceProvider,
  IndustryCanvasProvider,
  TrackingContextProvider,
  createTrackUsage,
} from '@fusion/industry-canvas';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useSDK } from '@cognite/sdk-provider';

import { useUserInformation } from '../hooks/useUserInformation';

import { ICProvider } from './ICProvider';

const trackUsage = createTrackUsage({
  app: 'IC',
});

const Spinner = () => <Loader />;

export default function App() {
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  return (
    <Suspense fallback={<Spinner />}>
      <TrackingContextProvider trackUsage={trackUsage}>
        <ICProvider flow={flow} sdk={sdk} userInfo={userInfo}>
          <SpaceProvider>
            <UserProfileProvider>
              <IndustryCanvasProvider>
                <Routes>
                  <Route
                    path="/industrial-canvas"
                    element={<IndustryCanvasHomePage />}
                  />
                  <Route
                    path="/industrial-canvas/canvas"
                    element={<IndustryCanvasPage />}
                  />
                </Routes>
              </IndustryCanvasProvider>
            </UserProfileProvider>
          </SpaceProvider>
        </ICProvider>
      </TrackingContextProvider>
    </Suspense>
  );
}
