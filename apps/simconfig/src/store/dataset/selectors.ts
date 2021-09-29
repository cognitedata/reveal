import { StoreState } from 'store/types';

export const selectDatasets = (state: StoreState) => state.dataset.datasets;
