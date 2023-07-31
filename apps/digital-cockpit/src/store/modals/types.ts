import { ActionType } from 'typesafe-actions';

import * as actions from './actions';

export enum ModalActionTypes {
  MODAL_OPEN = 'modal/OPEN',
  MODAL_CLOSE = 'modal/CLOSE',
}

export type ModalRootAction = ActionType<typeof actions>;

export type ModalType =
  | 'DeleteSuite'
  | 'DeleteBoard'
  | 'EditSuite'
  | 'EditBoard'
  | 'ShareLink'
  | 'UploadLogo'
  | 'SelectApplications'
  | 'AppConfig'
  | 'MoveBoard'
  | 'MoveSuite'
  | null;

export type Modal = {
  modalType: ModalType;
  modalProps?: any;
};

export interface ModalState {
  modalConfig: Modal;
}
