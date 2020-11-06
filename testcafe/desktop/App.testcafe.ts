import { screen } from '@testing-library/testcafe';

import { find, log, logErrors } from '../utils';

fixture('App')
  .page(`${process.env.BASE_URL}/publicdata/home`)
  .afterEach(() => logErrors());

test('Check whether header is rendered', async (t) => {
  log('Checking for page content');
  const header = find('header');
  await t.expect(header.visible).ok('Should be visible');
});

test('Check some page content', async (t) => {
  log('Checking for page content');
  await t.click(screen.getByText('What are sidecars', { exact: false }));

  await t
    .expect(screen.getByText('Take me back home', { exact: false }).exists)
    .ok();
});
