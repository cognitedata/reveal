import { screen } from '@testing-library/testcafe';
import { t } from 'testcafe';

import { progress } from '../../utils';
import App from '../App';

class MainSearch {
  mainSearchInput = screen.getByTestId('main-search-input');

  doEmptySearch = async () => {
    progress('Do an empty search');
    await t
      .selectText(this.mainSearchInput.find('input'))
      .pressKey('delete')
      .pressKey('enter');
  };

  doSearch = async (search: string) => {
    progress(`Searching for '${search}'`);
    await t
      .click(this.mainSearchInput)
      .typeText(this.mainSearchInput, search, {
        speed: 0.5,
        replace: true,
      })
      .pressKey('enter');
  };

  getSearchPhrase = async () => {
    this.clickOnSearchInput();

    const searchPhrase = this.mainSearchInput.find(
      'div.cogs-select__value-container'
    ).innerText;

    await App.pressKey('esc');

    return searchPhrase;
  };

  clickOnSearchInput = async () => {
    await t.click(this.mainSearchInput);
  };
}

export default new MainSearch();
