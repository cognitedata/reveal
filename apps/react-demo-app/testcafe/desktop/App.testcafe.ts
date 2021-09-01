import { t, Selector, ClientFunction } from 'testcafe';
import { screen } from '@testing-library/testcafe';

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
  const sidecarInfo = Selector('button').withText('Sidecar Info');
  await t.expect(sidecarInfo.exists).ok('');

  await t.click(sidecarInfo);

  log('Checking for page content');
  await t.click(screen.getByText('What is the Sidecar', { exact: false }));
});

test('Checking sdk setup', async () => {
  log('Goto the SDK page');
  const menuButton = screen.getByText('Cognite SDK');
  await t.click(menuButton);

  // log('Checking for page content');
  // eslint-disable-next-line @cognite/no-unissued-todos
  // TODO - add content into this tenant and check for it here
});

test('Logout redirects to the main page', async () => {
  log('Open sidebar');
  const sidebarOpenerButton = screen.getByLabelText('Open sidebar');
  await t.click(sidebarOpenerButton);

  log('Click logout button');
  const logoutButton = screen.getByText('Logout');
  await t.click(logoutButton);

  const getWindowLocation = ClientFunction(() => window.location);

  const location = await getWindowLocation();

  await t.expect(location.href.slice(0, -1)).eql(location.origin);
});
