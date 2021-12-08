import { DeepPartial } from '@reduxjs/toolkit';
import { RootState } from '@platypus-app/redux/store';
import mockDecorator from './mockDecorator';

export const APP_PROVIDERS_PARAMETER_NAME = 'providersConfig';

export type BaseRenderOptions = {
  redux?: DeepPartial<RootState>;
};

export type StorybookParameters = {
  [APP_PROVIDERS_PARAMETER_NAME]: BaseRenderOptions;
};

export type StoryConfiguration = {
  redux?: DeepPartial<RootState>;
  decorators?: any[];
  setupMocks?: any;
};

export default function configureStory({
  decorators: passedDecorators = [],
  setupMocks,
  redux,
  ...rest
}: StoryConfiguration) {
  const decorators = setupMocks
    ? [...passedDecorators, mockDecorator(setupMocks)]
    : passedDecorators;

  const parameters: StorybookParameters = {
    [APP_PROVIDERS_PARAMETER_NAME]: {
      redux,
    },
  };

  return {
    ...rest,
    parameters,
    decorators,
    setupMocks,
    redux,
  };
}
