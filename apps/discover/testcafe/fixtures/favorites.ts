import { favorites } from '../../src/modules/api/favorites';
import { UpdateFavoriteContentData } from '../../src/modules/favorite/types';
import App from '../__pages__/App';
import { getFullUserId, getTokenHeaders, progress, testRunId } from '../utils';

const FAV_SET_FOR_TEST_RUN = testRunId;

export const deleteAllAndCreateSetForTestRun = async () => {
  return deleteFavorites()
    .then(() => addFavorite(FAV_SET_FOR_TEST_RUN))
    .then((setId) => ({ setId, favoriteSetName: FAV_SET_FOR_TEST_RUN }));
};

export const deleteFavorites = async () => {
  const headers = await getTokenHeaders();
  const favoritesList = await favorites.list(headers, App.project);
  const userId = getFullUserId();

  const deleting = favoritesList.map((favorite) => {
    if (favorite.owner.id === userId) {
      progress(`Deleting favorite: ${favorite.name}`);
      return favorites.delete(favorite.id, headers, App.project);
    }
    progress(`Skipping delete on shared favorite: ${favorite.name}`);
    return Promise.resolve();
  });

  await Promise.all(deleting);
  progress(`Deletion of all favorites complete`);
};

export const addFavorite = async (
  name: string,
  description = 'description'
) => {
  const headers = await getTokenHeaders();

  try {
    const createdFavorite = await favorites.create(
      { name, description },
      headers,
      App.project
    );
    return createdFavorite;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('addFavorite error:', error);
    return Promise.resolve();
  }
};

export const updateFavoriteContent = async (
  data: UpdateFavoriteContentData
) => {
  const headers = await getTokenHeaders();
  const updateContent = await favorites.updateFavoriteContent(
    data.id,
    data.updateData,
    headers,
    App.project
  );

  return updateContent;
};
