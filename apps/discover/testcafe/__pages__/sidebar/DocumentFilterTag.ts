import { t } from 'testcafe';

import { progress } from '../../utils/utils';
import App from '../App';

class DocumentFilterTag {
  exists = async (name: string, exists: boolean) => {
    progress(`Checking if tag: ${name} exists: ${exists}`);
    if (exists) {
      await t.expect(App.sidebar.documentFilterTagWithText(name).exists).ok();
    } else {
      await t
        .expect(App.sidebar.documentFilterTagWithText(name).exists)
        .notOk({ timeout: 2000 });
    }
  };

  clickRemove = async (name: string) => {
    progress(`Click remove tag: ${name}`);
    await t.click(App.sidebar.documentFilterTagWithText(name).find('svg'));
  };

  clickClearAll = async () => {
    progress('Click clear all tag');
    await t.click(App.sidebar.documentClearAllFilterTag());
  };
}

export default new DocumentFilterTag();
