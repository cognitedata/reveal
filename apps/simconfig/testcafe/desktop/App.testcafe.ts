import { log, logErrors } from '../utils';

import { regularUser } from './login.role';

fixture('App')
  .meta({ page: 'home' })
  .page(process.env.BASE_URL)
  .beforeEach((t) => t.useRole(regularUser))
  .afterEach((t) =>
    logErrors(t, { error: true, warn: true, log: true, info: true })
  );

test('Check sidecars page content', async () => {
  log('Goto the sidecar page');
});

test('Checking sdk setup', async () => {
  log('Goto the SDK page');
});
