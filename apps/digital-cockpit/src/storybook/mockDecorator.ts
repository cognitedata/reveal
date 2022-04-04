import { PartialStoryFn, StoryContext } from '@storybook/addons';

import useSandbox, { SetupMocks } from './useSandbox';

function mockDecorator<T>(setupMocks: SetupMocks) {
  return (storyFn: PartialStoryFn<T>, context: StoryContext) => {
    useSandbox(setupMocks);
    return storyFn(context);
  };
}

export default mockDecorator;
