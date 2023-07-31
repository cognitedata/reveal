import useSelector from 'hooks/useSelector';

export const useUserState = () => {
  return useSelector((state) => state.user);
};

export const useUserHasGivenConsent = () => {
  return useUserState().hasGivenConsent;
};
