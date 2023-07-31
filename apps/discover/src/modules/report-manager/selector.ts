import useSelector from 'hooks/useSelector';

export const useWellFeedback = () => {
  return useSelector((state) => state.reportManager.wellFeedback);
};
