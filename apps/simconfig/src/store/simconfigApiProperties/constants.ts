import type { SimconfigApiPropertiesState } from '@cognite/simconfig-api-sdk/rtk';

export const initialState: SimconfigApiPropertiesState = {
  authToken: undefined,
  baseUrl: undefined,
  project: '',
};
