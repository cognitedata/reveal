import { initialize } from 'msw-storybook-addon';

initialize({
  onUnhandledRequest: ({ method, url }) => {
    // Log error on equests that should be handled but are not.
    if (url.pathname.endsWith('/graphql')) {
      console.error(`Unhandled ${method} request to ${url}`);
    }
  },
});
