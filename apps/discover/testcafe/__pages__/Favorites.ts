import { Selector } from 'testcafe';

import { BaseSearchPage } from './BaseSearch';
import ShareFavoriteDialog from './ShareFavoriteDialog';

class FavoritesPage extends BaseSearchPage {
  public readonly shareFavoriteDialog = ShareFavoriteDialog;

  public readonly favoriteSetTitle = (title: string) =>
    Selector('div').withExactText(title);

  public readonly favoriteSavedSearchEmptyContainer = Selector(
    '[data-testid="empty-state-container"]'
  );
}

export default new FavoritesPage();
