import { t } from 'testcafe';

import App from '../../__pages__/App';
import { startTest, logErrors } from '../../utils';

fixture('Search: map based testing')
  .meta({ page: 'search:map', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseUrl)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.map.waitForMapRenders();
  })
  .afterEach(async () =>
    logErrors({ log: true, info: true, warn: true, error: true })
  );

startTest('Polygon search - no results', async () => {
  await App.map.doPolygonSearch();

  // await App.documentSearchPage.doSearch(`filename:'${filename}'`);

  // const originalCount = await App.resultTable.row.count;

  // progress('No records should be found');
  // await t.expect(originalCount).eql(0);

  // const polygon = filterClearPage.polygonValue();

  // progress('polygon input tag should be available');
  // await t.expect(polygon.exists).eql(true);

  // const search = filterClearPage.searchInputValue(filename);
  // progress('search input tag should be available');
  // await t.expect(search.exists).eql(true);

  // progress('Clear polygon input');
  // await t.click(filterClearPage.polygonCloseBtn());

  // await t
  //   .expect(App.resultTable.row.exists)
  //   .ok({ timeout: 2000 });

  // const newCount = await App.resultTable.row.count;

  // progress(`Original count: ${originalCount}`);
  // progress(`After count: ${newCount}`);

  // await t.expect(newCount).gt(originalCount);
});

startTest('Polygon search - found results', async () => {
  await App.map.doPolygonSearch();
  await App.documentSearchPage.doCommonSearch();

  // const polygon = filterClearPage.polygonValue();
  // progress('polygon input tag should be available');
  // await t.expect(polygon.exists).eql(true);

  // const search = filterClearPage.searchInputValue(filename);
  // progress('search input tag should be available');
  // await t.expect(search.exists).eql(true);
});
