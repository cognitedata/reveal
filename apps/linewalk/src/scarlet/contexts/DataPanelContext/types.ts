import { DataElement, DataElementOrigin, Detection } from 'scarlet/types';

export type DataPanelState = {
  isVisible: boolean;
  isActiveNewDataSource: boolean;
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
    }
  | {
      type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE;
      isActive: boolean;
    };

export enum DataPanelActionType {
  TOGGLE_PANEL = 'toggle-panel',
  SET_CURRENT_ORIGIN = 'set-current-origin',
  OPEN_DATA_ELEMENT = 'open-data-element',
  CLOSE_DATA_ELEMENT = 'close-data-element',
  SET_ACTIVE_DETECTION = 'set-active-detection',
  TOGGLE_NEW_DATA_SOURCE = 'toggle-new-data-source',
}
