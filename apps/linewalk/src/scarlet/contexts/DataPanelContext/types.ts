import {
  DataElement,
  DataElementOrigin,
  DataElementState,
} from 'scarlet/types';

export type DataPanelState = {
  isVisible: boolean;
  currentOrigin: DataElementOrigin;
  modal?: {
    dataElement: DataElement;
    state: DataElementState;
  };
};

export type DataPanelAction =
  | {
      type: DataPanelActionType.TOGGLE_PANEL;
    }
  | {
      type: DataPanelActionType.SET_CURRENT_ORIGIN;
      origin: DataElementOrigin;
    };

export enum DataPanelActionType {
  TOGGLE_PANEL = 'toggle-panel',
  SET_CURRENT_ORIGIN = 'set-current-origin',
}
