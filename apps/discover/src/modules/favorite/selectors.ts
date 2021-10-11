import useSelector from 'hooks/useSelector';

export const useFavourite = () => {
  return useSelector((state) => state.favourite);
};

export const useViewMode = () => {
  return useFavourite().viewMode;
};
