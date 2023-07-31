import useSelector from 'hooks/useSelector';

export const useFavourite = () => {
  return useSelector((state) => state.favorites);
};

export const useIsCreateFavoriteModalOpenSelector = () => {
  return useSelector((state) => state.favorites.isCreateModalVisible);
};
export const useItemsToAddOnFavoriteCreationSelector = () => {
  return useSelector((state) => state.favorites.itemsToAddOnFavoriteCreation);
};

export const useViewMode = () => {
  return useFavourite().viewMode;
};
