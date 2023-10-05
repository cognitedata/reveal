import type { MakeGenerics, Route } from 'react-location';
import { Navigate } from 'react-location';

import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';

import type {
  CalculationType,
  CalculationTypeUserDefined,
  GetDefinitionsApiResponse,
  Simulator,
} from '@cognite/simconfig-api-sdk/rtk';
import { api } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationDetails, ModelLibrary } from './pages';
import { CalculationConfiguration } from './pages/CalculationConfiguration/CalculationConfiguration';
import { CalculationRunDetails } from './pages/CalculationRunDetails/CalculationRunDetails';
import { CalculationRuns } from './pages/CalculationRuns/CalculationRuns';
import { CustomCalculationConfiguration } from './pages/CustomCalculationConfiguration/CustomCalculationConfiguration';
import { NewModel } from './pages/ModelLibrary';
import type { StoreState } from './store/types';

export type AppLocationGenerics = MakeGenerics<{
  LoaderData: {
    definitions?: GetDefinitionsApiResponse;
  };
  Params: Record<string, string> & {
    simulator?: Simulator;
    calculationType?: CalculationType;
    userDefined?: CalculationTypeUserDefined;
  };
  RunListParams: Record<string, string> & {
    simulator?: Simulator;
    calculationType?: CalculationType;
    modelName?: string;
  };
  RouteMeta: {
    title?: (params?: AppLocationGenerics['Params']) => string;
    breadcrumb?: (params?: AppLocationGenerics['Params']) => React.ReactElement;
  };
}>;

export function routes(
  dispatch: ThunkDispatch<StoreState, null, AnyAction>,
  project: string
): Route<AppLocationGenerics>[] {
  return [
    {
      path: 'simint',
      children: [
        {
          path: 'model-library',
          loader: async () => ({
            definitions: (
              await dispatch(api.endpoints.getDefinitions.initiate({ project }))
            ).data,
          }),
          meta: {
            title: () => 'Model library',
          },
          children: [
            {
              path: '/',
              element: <ModelLibrary />,
            },
            {
              path: 'models',
              children: [
                {
                  path: ':simulator',
                  children: [
                    {
                      path: ':modelName',
                      children: [
                        {
                          path: '/',
                          element: <ModelLibrary />,
                        },
                        {
                          path: 'calculations/:calculationType',
                          children: [
                            {
                              path: '/',
                              element: <CalculationDetails />,
                            },
                            {
                              path: 'configuration',
                              element: <CalculationConfiguration />,
                            },
                            {
                              path: ':userDefined',
                              children: [
                                {
                                  path: '/',
                                  element: <CalculationDetails />,
                                },
                                {
                                  path: 'configuration',
                                  element: <CustomCalculationConfiguration />,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          path: ':selectedTab',
                          element: <ModelLibrary />,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'new-model',
              element: <NewModel />,
              meta: {
                title: () => 'New model',
              },
            },
          ],
        },
        {
          path: 'logout',
        },
        {
          path: 'calculations',
          loader: async () => ({
            definitions: (
              await dispatch(api.endpoints.getDefinitions.initiate({ project }))
            ).data,
          }),
          children: [
            {
              path: 'runs',
              children: [
                {
                  path: '/',
                  element: <CalculationRuns />,
                },
                {
                  path: ':runId',
                  element: <CalculationRunDetails />,
                },
              ],
            },
          ],
        },
        {
          element: <Navigate to="model-library" replace />,
        },
      ],
    },
  ];
}
