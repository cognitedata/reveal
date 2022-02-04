import { DataElement, DataElementOrigin, Detection } from 'scarlet/types';

export type DataPanelState = {
  isVisible: boolean;
  currentOrigin: DataElementOrigin;
  visibleDataElement?: DataElement;
  activeDetection?: Detection;
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
      detection?: Detection;
    }
  | {
      type: DataPanelActionType.CLOSE_DATA_ELEMENT;
    }
  | {
      type: DataPanelActionType.SET_ACTIVE_DETECTION;
      detection: Detection;
    };

export enum DataPanelActionType {
  TOGGLE_PANEL = 'toggle-panel',
  SET_CURRENT_ORIGIN = 'set-current-origin',
  OPEN_DATA_ELEMENT = 'open-data-element',
  CLOSE_DATA_ELEMENT = 'close-data-element',
  SET_ACTIVE_DETECTION = 'set-active-detection',
}
