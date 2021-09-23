import { t } from 'testcafe';
import { screen } from '@testing-library/testcafe';

import { log, logErrors } from '../utils';

import { regularUser } from './login.role';

fixture('Comments')
  .meta({ page: 'comments' })
  .page(process.env.BASE_URL)
  .beforeEach((t) => t.useRole(regularUser))
  .afterEach((t) =>
    logErrors(t, { error: true, warn: false, log: false, info: false })
  );

test('Checking comments page', async () => {
  log('Goto the comments page');
  const menuButton = screen.getByRole('link', { name: 'Comments' });
  await t.click(menuButton);

  await t.click(screen.getByText('Slider'));

  log('Checking for an asset to comment on');
  const asset = screen.getByText('Asset name: test-item-3');
  await t.click(asset);

  screen.getByPlaceholderText('Add a comment...');
});
