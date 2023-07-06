import useSandbox, { SetupMocks } from './useSandbox';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mockDecorator<T>(setupMocks: SetupMocks) {
  return (storyFn: any, context: any) => {
    useSandbox(setupMocks);
    return storyFn(context);
  };
}

export default mockDecorator;
