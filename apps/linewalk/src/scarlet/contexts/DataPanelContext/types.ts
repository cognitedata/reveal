import {
  Annotation,
  DataElement,
  DataElementOrigin,
  Detection,
  DetectionType,
} from 'scarlet/types';

export type DataPanelStateConnectedElementsModal = {
  dataElement: DataElement;
  detection: Detection;
};

export type DataPanelState = {
  isVisible: boolean;
  newDetection?: Detection;
  isActiveNewDataSource: boolean;
  currentOrigin: DataElementOrigin;
  visibleDataElement?: DataElement;
  activeDetection?: Detection;
  checkedDataElements: DataElement[];
  connectedElementsModal?: DataPanelStateConnectedElementsModal;
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
      type: DataPanelActionType.SET_NEW_MANUAL_DETECTION;
      detectionType: DetectionType;
      annotation?: Annotation;
    }
  | {
      type: DataPanelActionType.REMOVE_NEW_DETECTION;
    }
  | {
      type: DataPanelActionType.TOGGLE_NEW_DATA_SOURCE;
      isActive: boolean;
    }
  | {
      type: DataPanelActionType.TOGGLE_DATA_ELEMENT;
      dataElement: DataElement;
      checked: boolean;
    }
  | {
      type: DataPanelActionType.UNCHECK_ALL_DATA_ELEMENTS;
    }
  | {
      type: DataPanelActionType.OPEN_CONNECTED_ELEMENTS_MODAL;
      dataElement: DataElement;
      detection: Detection;
    }
  | {
      type: DataPanelActionType.CLOSE_CONNECTED_ELEMENTS_MODAL;
    };

export enum DataPanelActionType {
  TOGGLE_PANEL = 'toggle-panel',
  SET_CURRENT_ORIGIN = 'set-current-origin',
  OPEN_DATA_ELEMENT = 'open-data-element',
  CLOSE_DATA_ELEMENT = 'close-data-element',
  SET_ACTIVE_DETECTION = 'set-active-detection',
  SET_NEW_MANUAL_DETECTION = 'set-new-manuel-detection',
  REMOVE_NEW_DETECTION = 'remove-new-detection',
  TOGGLE_NEW_DATA_SOURCE = 'toggle-new-data-source',
  TOGGLE_DATA_ELEMENT = 'toggle-data-element',
  UNCHECK_ALL_DATA_ELEMENTS = 'unselect-all-data-elements',
  OPEN_CONNECTED_ELEMENTS_MODAL = 'open-connected-elements-modal',
  CLOSE_CONNECTED_ELEMENTS_MODAL = 'close-connected-elements-modal',
}
