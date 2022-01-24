import { screen } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import {
  CREATE_SET_MODAL_BUTTON_TEXT,
  CREATE_SET_MODAL_DESCRIPTION_PLACEHOLDER,
  CREATE_SET_MODAL_TITLE_PLACEHOLDER,
  DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  EDIT_SET_MODAL_BUTTON_TEXT,
} from '../../src/pages/authorized/favorites/constants';
import {
  SHARE_SUCCESS_TOAST,
  SHARE_MODAL_BUTTON_TEXT,
} from '../../src/pages/authorized/favorites/modals/constants';
import { progress, logErrors } from '../utils';

export const FAVORITE_DESCRIPTION_TESTCAFE = 'TESTING_DESC_CONTENT';

class CreateFavoriteDialog {
  public readonly titleInput = screen.getByPlaceholderText(
    CREATE_SET_MODAL_TITLE_PLACEHOLDER
  );

  public readonly descriptionInput = screen.getByPlaceholderText(
    CREATE_SET_MODAL_DESCRIPTION_PLACEHOLDER
  );

  public readonly createButton = screen.getByText(
    CREATE_SET_MODAL_BUTTON_TEXT,
    {
      selector: '.cogs-modal-footer-buttons > button',
    }
  );

  public readonly shareButton = screen.getByText(SHARE_MODAL_BUTTON_TEXT, {
    selector: '.cogs-modal-footer-buttons > button',
  });

  public readonly deleteButton = screen.getByText(
    DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT,
    {
      selector: '.cogs-modal-footer-buttons > button',
    }
  );

  public readonly duplicateButton = screen.getByText(
    DUPLICATE_SET_MODAL_BUTTON_TEXT,
    {
      selector: '.cogs-modal-footer-buttons > button',
    }
  );

  public readonly saveButton = screen.getByText(EDIT_SET_MODAL_BUTTON_TEXT, {
    selector: '.cogs-modal-footer-buttons > button',
  });

  public readonly cancelButton = screen.getByText('Cancel', {
    selector: 'button',
  });

  public readonly confirmationText = screen.queryAllByText(SHARE_SUCCESS_TOAST);

  public readonly closeIcon = Selector(`.cogs-modal-close`).nth(0);

  getFooterButton = (text: string) => Selector('button').withExactText(text);

  clickCreateButton = async () => {
    progress('Click create button');
    await t.click(this.createButton);
  };

  clickShareButton = async () => {
    progress('Click share button');
    await t.click(this.shareButton);
  };

  clickDeleteButton = async () => {
    progress('Click delete button');
    await t.click(this.deleteButton);
  };

  clickCancelButton = async () => {
    progress('Click cancel button');
    await t.click(this.cancelButton);
  };

  clickDuplicateButton = async () => {
    progress('Click duplicate button');
    await t.click(this.duplicateButton);
  };

  clickSaveButton = async () => {
    progress('Click save button');
    await t.click(this.saveButton);
  };

  fillInName = async (name: string) => {
    progress(`Fill in the name: ${name}`);
    try {
      await t.typeText(this.titleInput, name, {
        replace: true,
      });
    } catch (e) {
      await logErrors();
    }
  };

  fillInDescription = async (description: string) => {
    progress(`Fill in the name: ${description}`);
    try {
      await t.typeText(this.descriptionInput, description, {
        replace: true,
      });
    } catch (e) {
      await logErrors();
    }
  };

  fillInNameAndDescription = async (
    name: string,
    description: string = FAVORITE_DESCRIPTION_TESTCAFE
  ) => {
    progress('Fill in the name and description');
    await this.fillInName(name);
    await this.fillInDescription(description);
  };

  checkIfNameFieldHasValue = async (name: string) => {
    progress(`Name field should have the value: ${name}`);
    await t.expect(this.titleInput.value).eql(name);
  };

  checkIfDescriptionFieldHasValue = async (description: string) => {
    progress(`Description field should have the value: ${description}`);
    await t.expect(this.descriptionInput.value).eql(description);
  };

  fillCreateFavoriteSetDetailsAndClickButton = async (
    favoriteSetName: string,
    buttonText: string
  ) => {
    await this.fillInNameAndDescription(favoriteSetName);
    progress(`Click ${buttonText} button to create the set`);
    await t.click(this.getFooterButton(buttonText));
  };
}

export default new CreateFavoriteDialog();
