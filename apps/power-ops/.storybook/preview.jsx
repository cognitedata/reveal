import { initialize, mswDecorator } from 'msw-storybook-addon';
import { globalStylesDecorator } from 'utils/test/storyDecorators';
import { powerOpsApiHandlers } from 'utils/test/powerOpsApiHandlers';
import { cdfApiHandlers } from 'utils/test/cdfApiHandlers';

initialize({
  onUnhandledRequest({ url: { href }, method }) {
    // If the unhandled request is to an api (CDf or PowerOps), stop it.
    if (href.includes('cognitedata.com') || href.includes('cognite.ai'))
      throw new Error(`Missing mock to (${method} ${href})`);
  },
});

export const decorators = [globalStylesDecorator, mswDecorator];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers: {
      powerOpsApiHandlers,
      cdfApiHandlers,
    },
  },
};
