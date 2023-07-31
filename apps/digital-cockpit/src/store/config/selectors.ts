import { StoreState } from 'store/types';

import { ConfigState } from './types';

export const getConfigState = (state: StoreState): ConfigState => state.config;
