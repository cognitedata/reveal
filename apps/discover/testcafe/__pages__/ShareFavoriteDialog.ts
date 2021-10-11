import { screen } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import { logErrors, progress } from '../utils';

class ShareFavoriteDialog {
  public readonly ownerIndicator = screen.getByText('Owner');

  public readonly userSearchInput = screen.getByTestId('shared-user-input');

  public readonly shareButton = screen.getByTestId('share-with-user-btn');

  public readonly unshareButton = screen.getByTestId('shared-user-remove-btn');

  public readonly sharedTitleInput = Selector(
    `[data-testid="shared-user-input"]`
  );

  SelectSharedUserOption = (text: string) =>
    Selector(`div[class*="cogs-select__option"]`).withText(text).nth(0);

  SelectSharedUsername = (text: string) =>
    Selector(`[data-testid="shared-with-username"]`).withText(text).nth(0);

  checkIfOwnerIsDisplayed = async () => {
    progress('Owner should be displayed');
    await t.expect(this.ownerIndicator.exists).eql(true);
  };

  checkIfSharedUserIsDisplayed = async (userName: string) => {
    progress(`${userName} should be in the shared users list`);
    await t.expect(this.SelectSharedUsername(userName).exists).eql(true);
  };

  unshareFavorite = async () => {
    progress(`Click on unshare button`);
    await t.click(this.unshareButton);
  };

  shareFavoriteWithUser = async (name: string) => {
    progress(`Fill in the name: ${name}`);
    try {
      await t
        .click(this.sharedTitleInput)
        .typeText(this.sharedTitleInput, name, {
          replace: true,
          speed: 0.5,
        });

      await t.click(this.SelectSharedUserOption(name));

      progress('Share the favorite');
      await t.click(this.shareButton);
    } catch (e) {
      await logErrors();
    }
  };
}

export default new ShareFavoriteDialog();
