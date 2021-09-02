import { t } from 'testcafe';
import { screen } from '@testing-library/testcafe';

import { log, logErrors } from '../utils';

import { regularUser } from './login.role';

fixture('Comments')
  .meta({ page: 'comments' })
  .page(process.env.BASE_URL)
  .beforeEach((t) => t.useRole(regularUser))
  .afterEach((t) =>
    logErrors(t, { error: true, warn: true, log: true, info: true })
  );

test('Checking comments page', async () => {
  log('Goto the comments page');
  const menuButton = screen.getByText('Comments');
  await t.click(menuButton);

  log('Checking for an asset to comment on');
  const asset = screen.getByText('Asset name: test-item-2');
  await t.click(asset);

  screen.getByPlaceholderText('Add a comment...');
});
