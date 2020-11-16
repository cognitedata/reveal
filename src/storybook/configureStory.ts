import { DecoratorFunction } from '@storybook/addons';
import { PartialRootState } from 'store/types';
import { EnvironmentState } from 'reducers/environment';
import { SetupMocks } from './useSandbox';
import mockDecorator from './mockDecorator';

type BaseRenderOptions = {
  redux?: PartialRootState;
  environment?: Partial<EnvironmentState>;
  pathname?: string;
};

export type AppProvidersParameters = BaseRenderOptions;

export const APP_PROVIDERS_PARAMETER_NAME = 'providersConfig' as 'providersConfig';

type StorybookParameters = {
  [key in typeof APP_PROVIDERS_PARAMETER_NAME]: BaseRenderOptions;
};

export type StoryConfiguration = AppProvidersParameters & {
  name?: string;
  decorators?: DecoratorFunction[];
  setupMocks?: SetupMocks;
};

function configureStory<T extends StoryConfiguration>({
  decorators: passedDecorators = [],
  setupMocks,
  redux = {},
  pathname,
  environment = {},
  ...rest
}: T) {
  const decorators = setupMocks
    ? [...passedDecorators, mockDecorator(setupMocks)]
    : passedDecorators;

  const parameters: StorybookParameters = {
    [APP_PROVIDERS_PARAMETER_NAME]: {
      redux,
      pathname,
      environment,
    },
  };

  return ({
    ...rest,
    parameters,
    decorators,
    setupMocks,
    redux,
  } as unknown) as T;
}

export default configureStory;
