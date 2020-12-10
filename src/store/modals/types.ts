import { TS_FIX_ME } from 'types/core';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum ModalActionTypes {
  MODAL_OPEN = 'modal/OPEN',
  MODAL_CLOSE = 'modal/CLOSE',
}

export type ModalRootAction = ActionType<typeof actions>;

export type ModalType =
  | 'Delete'
  | 'EditSuite'
  | 'CreateSuite'
  | 'AddBoard'
  | null;

export type Modal = {
  modalType: ModalType;
  modalProps?: TS_FIX_ME;
};

export interface ModalState {
  modalConfig: Modal;
}
