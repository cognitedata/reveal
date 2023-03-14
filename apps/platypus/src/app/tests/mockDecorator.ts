import { StoryContext, LegacyStoryFn } from '@storybook/addons';

import useSandbox, { SetupMocks } from './useSandbox';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mockDecorator<T>(setupMocks: SetupMocks) {
  return (storyFn: LegacyStoryFn, context: StoryContext) => {
    useSandbox(setupMocks);
    return storyFn(context);
  };
}

export default mockDecorator;
