import { createAction } from 'typesafe-actions';
import { Modal, ModalActionTypes } from './types';

export const modalOpen = createAction(ModalActionTypes.MODAL_OPEN)<Modal>();

export const modalClose = createAction(ModalActionTypes.MODAL_CLOSE)<void>();
