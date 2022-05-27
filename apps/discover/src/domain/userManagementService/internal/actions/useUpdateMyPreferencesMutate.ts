import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';

import { useUserPreferencesMutate } from './useUserPreferencesMutate';

export const useUpdateMyPreferencesMutate = () =>
  useUserPreferencesMutate(USER_MANAGEMENT_SYSTEM_KEY.ME).mutate;
