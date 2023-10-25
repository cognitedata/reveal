import '@cognite/cogs.js/dist/cogs.css';
import { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize({
  onUnhandledRequest(req, print) {
    if (
      req.url.pathname.startsWith('/assets/') ||
      req.url.pathname.endsWith('woff2')
    ) {
      return;
    }

    print.warning();
  },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
  },
  loaders: [mswLoader],
};

export default preview;
