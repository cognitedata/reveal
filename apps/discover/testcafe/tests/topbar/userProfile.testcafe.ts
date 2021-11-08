import App from '../../__pages__/App';
import { startTest, logErrors } from '../../utils';

fixture('User Profile')
  .meta({ page: 'user:profile', tenant: App.project })
  .page(App.baseApp)
  .beforeEach(async (t) => {
    await t.useRole(App.getUserRole());
  })
  .afterEach(() => logErrors());

// this is only for GCP projects now. so disabling the test here till we have a GCP test project in FakeIDP
startTest.skip('User is able to edit his first and last name', async () => {
  await App.userProfilePage.openUserProfileOverlay();
  await App.userProfilePage.updateFirstName('John');
  await App.userProfilePage.updateLastName('Doe');
  await App.userProfilePage.saveChanges();
});

startTest('User can see the logout and version info', async () => {
  await App.userProfilePage.openUserProfileOverlay();
  // await App.userProfilePage.checkIfVersionInfoIsDisplayed();
  await App.userProfilePage.checkIfLogoutButtonIsDisplayed();
});

startTest('Hide user profile panel on close', async () => {
  await App.userProfilePage.openUserProfileOverlay();
  // await App.userProfilePage.checkIfVersionInfoIsDisplayed();
  await App.userProfilePage.closeUserProfileOverlay();
});
