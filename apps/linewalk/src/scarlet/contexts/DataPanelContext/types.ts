import { DataElement, DataElementOrigin } from 'scarlet/types';

export type DataPanelState = {
  isVisible: boolean;
  currentOrigin: DataElementOrigin;
  visibleDataElement?: DataElement;
};

export type DataPanelAction =
  | {
      type: DataPanelActionType.TOGGLE_PANEL;
    }
  | {
      type: DataPanelActionType.SET_CURRENT_ORIGIN;
      origin: DataElementOrigin;
    }
  | {
      type: DataPanelActionType.OPEN_DATA_ELEMENT;
      dataElement: DataElement;
    }
  | {
      type: DataPanelActionType.CLOSE_DATA_ELEMENT;
    };

export enum DataPanelActionType {
  TOGGLE_PANEL = 'toggle-panel',
  SET_CURRENT_ORIGIN = 'set-current-origin',
  OPEN_DATA_ELEMENT = 'open-data-element',
  CLOSE_DATA_ELEMENT = 'close-data-element',
}
