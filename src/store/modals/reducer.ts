import { createReducer } from 'typesafe-actions';
import { ModalActionTypes, ModalState, ModalRootAction } from './types';

const initialState: ModalState = {
  modalConfig: {
    modalType: null,
  },
};

export const ModalReducer = createReducer(initialState)
  .handleAction(
    ModalActionTypes.MODAL_OPEN,
    (state: ModalState, action: ModalRootAction) => ({
      ...state,
      modalConfig: action.payload,
    })
  )
  .handleAction(ModalActionTypes.MODAL_CLOSE, (state: ModalState) => ({
    ...state,
    modalConfig: { modalType: null },
  }));
