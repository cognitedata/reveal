import { DecoratorFunction } from '@storybook/addons';
import { PartialRootState } from 'store/types';
import { CdfClient } from 'utils';

import { SetupMocks } from './useSandbox';
import mockDecorator from './mockDecorator';

type BaseRenderOptions = {
  redux?: PartialRootState;
  pathname?: string;
  mockCdfClient?: (mockClient: CdfClient) => CdfClient;
};

export type AppProvidersParameters = BaseRenderOptions;
export const APP_PROVIDERS_PARAMETER_NAME = 'providersConfig';

type StorybookParameters = {
  [key in typeof APP_PROVIDERS_PARAMETER_NAME]: BaseRenderOptions;
};

export type StoryConfiguration = AppProvidersParameters & {
  name?: string;
  decorators?: DecoratorFunction[];
  setupMocks?: SetupMocks;
  mockCdfClient?: (mockClient: CdfClient) => CdfClient;
};

function configureStory<T extends StoryConfiguration>({
  decorators: passedDecorators = [],
  redux = {},
  mockCdfClient,
  setupMocks,
  pathname,
  ...rest
}: T) {
  const decorators = setupMocks
    ? [...passedDecorators, mockDecorator(setupMocks)]
    : passedDecorators;

  const parameters: StorybookParameters = {
    [APP_PROVIDERS_PARAMETER_NAME]: {
      redux,
      pathname,
      mockCdfClient,
    },
  };

  return {
    ...rest,
    parameters,
    decorators,
    redux,
    mockCdfClient,
  } as unknown as T;
}

export default configureStory;
