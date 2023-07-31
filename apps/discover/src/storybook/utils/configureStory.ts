// import { DecoratorFunction } from '@storybook/addons';
// import { BaseRenderOptions } from 'test/utils/types';

// import { SetupMocks } from './useSandbox';
// import mockDecorator from './mockDecorator';

// export const APP_PROVIDERS_PARAMETER_NAME = 'providersConfig' as 'providersConfig';

// type StorybookParameters = {
//   [key in typeof APP_PROVIDERS_PARAMETER_NAME]: BaseRenderOptions;
// };

// export type StoryConfiguration = BaseRenderOptions & {
//   name?: string;
//   decorators?: DecoratorFunction[];
//   setupMocks?: SetupMocks;
// };

// function configureStory<T extends StoryConfiguration>({
//   decorators: passedDecorators = [],
//   setupMocks,
//   redux = {},
//   pathname,
//   ...rest
// }: T) {
//   const decorators = setupMocks
//     ? [...passedDecorators, mockDecorator(setupMocks)]
//     : passedDecorators;

//   const parameters: StorybookParameters = {
//     [APP_PROVIDERS_PARAMETER_NAME]: {
//       redux,
//       pathname,
//     },
//   };

//   return ({
//     ...rest,
//     parameters,
//     decorators,
//     setupMocks,
//     redux,
//   } as unknown) as T;
// }

// export default configureStory;

import constant from 'lodash/constant';

export default constant(true);
