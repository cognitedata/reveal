import { StoryContext, LegacyStoryFn } from '@storybook/addons';

import useSandbox, { SetupMocks } from './useSandbox';

function mockDecorator<T>(setupMocks: SetupMocks) {
  return (storyFn: LegacyStoryFn, context: StoryContext) => {
    useSandbox(setupMocks);
    return storyFn(context);
  };
}

export default mockDecorator;
