import type { MakeGenerics, Route } from 'react-location';
import { Navigate } from 'react-location';

import type { ThunkDispatch } from '@reduxjs/toolkit';

import { CalculationDetails, ModelLibrary } from 'pages';

import type {
  CalculationType,
  GetDefinitionsApiResponse,
  GetModelCalculationApiResponse,
  GetModelFileApiResponse,
  GetModelFileListApiResponse,
  Simulator,
} from '@cognite/simconfig-api-sdk/rtk';
import { api } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationConfiguration } from 'pages/CalculationConfiguration/CalculationConfiguration';
import { CalculationRuns } from 'pages/CalculationsRuns/CalculationsRuns';
import { NewModel } from 'pages/ModelLibrary';
import type { StoreState } from 'store/types';

import type { AnyAction } from 'redux';

export type AppLocationGenerics = MakeGenerics<{
  LoaderData: {
    definitions?: GetDefinitionsApiResponse;
    modelFiles?: GetModelFileListApiResponse;
    modelFile?: GetModelFileApiResponse;
    modelCalculation?: GetModelCalculationApiResponse;
  };
  Params: Record<string, string> & {
    simulator?: Simulator;
    calculationType?: CalculationType;
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
      path: 'model-library',
      loader: async () => ({
          definitions: (await dispatch(api.endpoints.getDefinitions.initiate()))
            .data,
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
                      loader: async ({ params: { simulator, modelName } }) => ({
                        modelFile:
                          project && simulator && modelName
                            ? (
                                await dispatch(
                                  api.endpoints.getModelFile.initiate({
                                    project,
                                    simulator,
                                    modelName,
                                  })
                                )
                              ).data
                            : undefined,
                      }),
                      children: [
                        {
                          path: '/',
                          loader: async ({
                            params: { simulator, modelName, calculationType },
                          }) => ({
                            modelCalculation:
                              project &&
                              simulator &&
                              modelName &&
                              calculationType
                                ? (
                                    await dispatch(
                                      api.endpoints.getModelCalculation.initiate(
                                        {
                                          project,
                                          simulator,
                                          modelName,
                                          calculationType,
                                        }
                                      )
                                    )
                                  ).data
                                : undefined,
                          }),
                          element: <CalculationDetails />,
                        },
                        {
                          path: 'configuration',
                          element: <CalculationConfiguration />,
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
        definitions: (await dispatch(api.endpoints.getDefinitions.initiate()))
          .data,
      }),
      children: [
        {
          path: 'runs',
          element: <CalculationRuns/>
        }
      ]
    },
    {
      element: <Navigate to="model-library" replace />,
    },
  ];
}
