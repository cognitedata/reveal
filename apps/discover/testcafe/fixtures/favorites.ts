import { favorites } from '../../src/modules/api/favorites';
import { UpdateFavoriteContentData } from '../../src/modules/favorite/types';
import App from '../__pages__/App';
import { getTokenHeaders, progress, testRunId } from '../utils';

const FAV_SET_FOR_TEST_RUN = testRunId;

export const deleteAllAndCreateSetForTestRun = async () => {
  return deleteFavorites()
    .then(() => addFavorite(FAV_SET_FOR_TEST_RUN))
    .then((setId) => ({ setId, favoriteSetName: FAV_SET_FOR_TEST_RUN }));
};

export const deleteFavorites = async () => {
  const token = await getTokenHeaders();
  const favoritesList = await favorites.list(token, App.tenant);

  const deleting = favoritesList.map((favorite) => {
    progress(`Deleting favorite: ${favorite.name}`);
    return favorites.delete(favorite.id, token, App.tenant);
  });

  await Promise.all(deleting);
  progress(`Deletion of all favorites complete`);
};

export const addFavorite = async (
  name: string,
  description = 'description'
) => {
  const token = await getTokenHeaders();

  try {
    const createdFavorite = await favorites.create(
      { name, description },
      token,
      App.tenant
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
  const token = await getTokenHeaders();
  const updateContent = await favorites.updateFavoriteContent(
    data,
    token,
    App.tenant
  );

  return updateContent;
};
