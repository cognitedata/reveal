import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { progress } from '../utils';

export class UserProfilePage {
  userProfileOpen = Selector('[data-testid="user-profile-open"]');

  userProfileClose = Selector('[data-testid="user-profile-close"]');

  userAvatar = screen.getByLabelText('Open user profile', {
    exact: true,
  });

  version = screen.getByLabelText('Version', {
    exact: true,
  });

  userInputFirstname = screen.getByLabelText('First Name', {
    exact: true,
  });

  userInputLastname = screen.getByLabelText('Last Name', {
    exact: true,
  });

  saveChangesButton = screen.getByRole('button', {
    name: 'Save',
  });

  savedSuccessMessage = screen.getByText('Success');

  closeButton = Selector('button[class*="cogs-drawer-close"]');

  logoutButton = screen.getByRole('button', {
    name: 'Logout',
  });

  openUserProfileOverlay = async () => {
    progress('Open the user profile overlay');
    await t.click(this.userAvatar);
    await this.checkIfUserProfileOverlayIsOpen();
  };

  closeUserProfileOverlay = async () => {
    progress('Close the user profile overlay');
    await t.click(this.closeButton);
    await this.checkIfUserProfileOverlayIsClose();
  };

  checkIfVersionInfoIsDisplayed = async () => {
    progress('Check the version information is on the page');
    await t.expect(this.version.exists).ok();
  };

  checkIfLogoutButtonIsDisplayed = async () => {
    progress('Check the logout button is on the page');
    await t.expect(this.logoutButton.exists).ok();
  };

  checkIfUserProfileOverlayIsOpen = async () => {
    progress('Check if user profile overlay is open');
    await t.expect(this.userProfileOpen.exists).ok({ timeout: 2000 });
  };

  checkIfUserProfileOverlayIsClose = async () => {
    progress('Check if user profile overlay is closed');
    await t.expect(this.userProfileClose.exists).ok({ timeout: 2000 });
  };

  updateFirstName = async (firstName: string) => {
    progress(`Update value for first name: ${firstName}`);
    await t
      .click(this.userInputFirstname)
      .selectText(this.userInputFirstname)
      .typeText(this.userInputFirstname, firstName);
  };

  updateLastName = async (lastName: string) => {
    progress(`Update value for last name: ${lastName}`);
    await t
      .click(this.userInputLastname)
      .selectText(this.userInputLastname)
      .typeText(this.userInputLastname, lastName);
  };

  saveChanges = async () => {
    progress('Save changes');
    await t.click(this.saveChangesButton);

    progress('Check that the Success message appeared');
    await t.click(this.savedSuccessMessage);
  };
}

export default new UserProfilePage();
