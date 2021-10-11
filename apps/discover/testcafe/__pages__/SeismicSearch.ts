import { t, Selector } from 'testcafe';

import { find } from '../utils';

import { BaseSearchPage } from './BaseSearch';

class SeismicSearchPage extends BaseSearchPage {
  public readonly seismicColorbandButton = find('seismic-color-button');

  public readonly seismicColorbandButtonRed = Selector('li').withText(
    'Red to black'
  );

  public readonly seismicTabClose = find('seismic-modal-close');

  closeSeismicModal = async () => {
    return t.click(this.seismicTabClose);
  };
}

export default new SeismicSearchPage();
