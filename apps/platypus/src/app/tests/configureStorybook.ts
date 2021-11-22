import { DeepPartial } from '@reduxjs/toolkit';
import { RootState } from '@platypus-app/redux/store';

export const APP_PROVIDERS_PARAMETER_NAME = 'providersConfig';

export type BaseRenderOptions = {
  redux?: DeepPartial<RootState>;
};

export type StorybookParameters = {
  [APP_PROVIDERS_PARAMETER_NAME]: BaseRenderOptions;
};

export type StoryConfiguration = {
  redux?: DeepPartial<RootState>;
};

export default function configureStory({ redux }: StoryConfiguration) {
  const parameters: StorybookParameters = {
    [APP_PROVIDERS_PARAMETER_NAME]: {
      redux,
    },
  };

  return {
    parameters,
  };
}
