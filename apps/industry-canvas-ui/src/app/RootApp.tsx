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
  IndustryCanvasService,
  CommentService,
} from '@fusion/industry-canvas';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { ChartsSdkInitialisationGuard } from '@cognite/charts-lib';
import { useSDK } from '@cognite/sdk-provider';

import { useUserInformation } from '../hooks/useUserInformation';

import Charts from './Charts';
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
          <SpaceProvider
            spaceDefinition={{
              space: IndustryCanvasService.INSTANCE_SPACE,
              name: 'Industrial Canvas instance space',
              description: 'The Industrial Canvas instance space',
            }}
            requiredReadScopes={[
              IndustryCanvasService.SYSTEM_SPACE,
              IndustryCanvasService.INSTANCE_SPACE,
            ]}
            requiredDatamodelWriteScopes={[
              IndustryCanvasService.INSTANCE_SPACE,
            ]}
          >
            <SpaceProvider
              spaceDefinition={{
                space: CommentService.INSTANCE_SPACE,
                name: 'Comment instance space',
                description: 'The comment instance space',
              }}
              requiredReadScopes={[
                CommentService.SYSTEM_SPACE,
                CommentService.INSTANCE_SPACE,
              ]}
              requiredDatamodelWriteScopes={[CommentService.INSTANCE_SPACE]}
            >
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
                    <Route
                      path="/industrial-canvas/test"
                      element={
                        <ChartsSdkInitialisationGuard>
                          <Charts />
                        </ChartsSdkInitialisationGuard>
                      }
                    />
                  </Routes>
                </IndustryCanvasProvider>
              </UserProfileProvider>
            </SpaceProvider>
          </SpaceProvider>
        </ICProvider>
      </TrackingContextProvider>
    </Suspense>
  );
}
