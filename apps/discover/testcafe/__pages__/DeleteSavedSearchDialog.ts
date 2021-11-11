import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import {
  SAVED_SEARCH_DELETED_MESSAGE,
  DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT,
} from '../../src/pages/authorized/favorites/tabs/savedSearches/constants';
import { progress } from '../utils';

import App from './App';

class DeleteSavedSearchDialog {
  public readonly container = Selector(
    '[data-testid="delete-saved-search-modal-container"]'
  );

  public readonly cancelButton = Selector('button').withText('Cancel');

  public readonly deleteButton = Selector('button').withText('Delete');

  public readonly modalBackdrop = Selector('.ReactModal__Overlay');

  public readonly successMessage = screen.queryAllByText(
    DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT
  );

  checkIfModalIsOpen = async () => {
    progress('Check if the feedback modal is open');
    await t.expect(App.deleteSavedSearchDialog.container.exists).ok();
  };

  checkIfModalIsClose = async () => {
    progress('Check if the feedback modal is open');
    await t.expect(App.deleteSavedSearchDialog.container.exists).notOk();
  };

  clickDeleteButton = async () => {
    progress('Click `Delete` button');
    await t.click(App.deleteSavedSearchDialog.deleteButton);
    await App.checkifToasterAppears(SAVED_SEARCH_DELETED_MESSAGE);
  };
}

export default new DeleteSavedSearchDialog();
