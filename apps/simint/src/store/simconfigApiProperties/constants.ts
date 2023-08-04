import type { SimconfigApiPropertiesState } from '@cognite/simconfig-api-sdk/rtk';

export const initialState: SimconfigApiPropertiesState = {
  authHeaders: {},
  baseUrl: undefined,
  project: '',
};
