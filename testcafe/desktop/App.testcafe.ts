import { t } from 'testcafe';
import { screen } from '@testing-library/testcafe';

import { find, log, logErrors } from '../utils';

fixture('App')
  .page(`${process.env.BASE_URL}/publicdata/home`)
  .afterEach(() => logErrors());

test('Checking for main page content', async () => {
  log('Checking for page content');
  const header = find('header');
  await t.expect(header.visible).ok('Should be visible');
});

test('Check sidecars page content', async () => {
  log('Clicking menu item');
  await t.click(screen.getByText('Sidecar info', { exact: false }));

  log('Checking for page content');
  await t.click(screen.getByText('What is the Sidecar', { exact: false }));
});
