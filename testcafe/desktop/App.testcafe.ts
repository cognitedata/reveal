import { screen } from '@testing-library/testcafe';

import { find, log } from '../utils';

fixture('App').page(`${process.env.BASE_URL}`);

test('Check whether header is rendered', async (t) => {
  const header = find('header');
  await t.expect(header.visible).ok('Should be visible');
});

test('Check some page content', async (t) => {
  log('Checking for page content');
  await t
    .expect(
      screen.getByText('Learn about how this is hosted', { exact: false })
        .exists
    )
    .ok();
});
