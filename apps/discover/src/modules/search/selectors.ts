import useSelector from 'hooks/useSelector';

export const useSearchState = () => {
  return useSelector((state) => state.search);
};
