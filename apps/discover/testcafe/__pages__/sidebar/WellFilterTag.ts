import { t } from 'testcafe';

import { progress } from '../../utils/utils';
import App from '../App';

class WellFilterTag {
  exists = async (name: string, exists: boolean) => {
    progress(`Checking if tag: ${name} exists: ${exists}`);
    if (exists) {
      await t.expect(App.sidebar.wellFilterTagWithText(name).exists).ok();
    } else {
      await t
        .expect(App.sidebar.wellFilterTagWithText(name).exists)
        .notOk({ timeout: 2000 });
    }
  };

  clickRemove = async (name: string) => {
    progress(`Click remove tag: ${name}`);
    await t.click(App.sidebar.wellFilterTagWithText(name).find('svg'));
  };

  clickClearAll = async () => {
    progress('Click clear all tag');
    await t.click(App.sidebar.wellClearAllFilterTag());
  };

  clickClearButton = async () => {
    progress('Click clear button');
    await t.click(App.sidebar.filterClearButton());
  };
}

export default new WellFilterTag();
