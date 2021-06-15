import { StoreState } from 'store/types';
import { ModalState } from './types';

export const getModalState = (state: StoreState): ModalState => state.modal;
