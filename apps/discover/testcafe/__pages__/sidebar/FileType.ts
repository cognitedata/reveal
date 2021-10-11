import { t } from 'testcafe';

import App from '../../__pages__/App';
import { progress } from '../../utils/utils';

class FileType {
  isChecked = async (name: string, checkedState = true) => {
    progress(
      `Checking checkbox status: ${name} ${
        checkedState ? '' : '(is unchecked)'
      }`
    );

    await t
      .expect(
        App.sidebar
          .getFilterOption(name)
          .parent()
          .parent()
          .find('input[type=checkbox]').checked
      )
      .eql(checkedState, { timeout: 3000 });
  };
}

export default new FileType();
