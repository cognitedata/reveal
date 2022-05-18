import React, { Reducer, useReducer } from 'react';
import { useSaveEquipment } from 'scarlet/hooks';

import { AppAction, AppActionType, AppState } from '.';
import {
  addComponent,
  addDetection,
  addRemark,
  updateDetection,
  approveEquipment,
  deleteComponents,
  removeDetection,
  updateComponents,
  updateDataElementState,
  setConnectedDataElements,
} from './utils';

const equipmentInitialState = {
  unitId: '',
  equipmentId: '',
  documents: { loading: true },
  equipment: { loading: true },
  equipmentConfig: { loading: true },
  saveState: { loading: false },
};

const initialState: AppState = {
  ...equipmentInitialState,
  unitListByFacility: { loading: true },
};

export const AppDispatchContext = React.createContext<
  React.Dispatch<AppAction>
>(() => null);
export const AppContext = React.createContext(initialState);

function reducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case AppActionType.INIT_UNITS:
      return {
        ...state,
        unitListByFacility: action.unitListByFacility,
      };
    case AppActionType.INIT_EQUIPMENT:
      return {
        ...state,
        facility: action.facility,
        unitId: action.unitId,
        equipmentId: action.equipmentId,
      };
    case AppActionType.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.documents,
      };
    case AppActionType.SET_EQUIPMENT:
      return {
        ...state,
        equipment: action.equipment,
        saveState: action.isInitialSave
          ? {
              loading: true,
              data: action.equipment.data,
              isInitial: action.isInitialSave,
            }
          : state.saveState,
      };
    case AppActionType.SET_EQUIPMENT_CONFIG:
      return {
        ...state,
        equipmentConfig: action.config,
      };
    case AppActionType.SET_SAVE_SATE:
      return {
        ...state,
        saveState: action.saveState,
      };
    case AppActionType.UPDATE_DETECTION: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, dataElement, detection, isApproved, ...detectionProps } =
        action;

      const equipmentToSave = updateDetection(
        state.saveState.data || state.equipment.data!,
        dataElement,
        detection,
        isApproved,
        detectionProps
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.ADD_DETECTION: {
      const equipment = addDetection(
        state.equipment.data!,
        action.dataElement,
        action.detection,
        action.value,
        action.externalSource,
        action.isApproved,
        action.isPrimary
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipment,
        },
      };
    }
    case AppActionType.REMOVE_DETECTION: {
      const equipmentToSave = removeDetection(
        state.equipment.data!,
        action.dataElement,
        action.detection
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.UPDATE_DATA_ELEMENTS_STATE: {
      const equipmentToSave = updateDataElementState(
        state.saveState.data || state.equipment.data!,
        action.dataElements,
        action.state,
        action.stateReason
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.CLEANUP_EQUIPMENT_DATA:
      return {
        ...state,
        ...equipmentInitialState,
      };
    case AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL: {
      return {
        ...state,
        dataElementModal: {
          dataElements: action.dataElements,
          state: action.state,
        },
      };
    }
    case AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL: {
      return {
        ...state,
        dataElementModal: undefined,
      };
    }
    case AppActionType.ADD_COMPONENT: {
      const equipmentToSave = addComponent(
        state.equipment.data!,
        action.component
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.DELETE_COMPONENTS: {
      const equipmentToSave = deleteComponents(
        state.equipment.data!,
        action.componentIds
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.UPDATE_COMPONENTS: {
      const equipmentToSave = updateComponents(
        state.equipment.data!,
        action.components
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.ADD_REMARK: {
      const equipmentToSave = addRemark(
        state.equipment.data!,
        action.dataElement,
        action.remark
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.APPROVE_EQUIPMENT: {
      const equipmentToSave = approveEquipment(state.equipment.data!);

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.SET_CONNECTED_DATA_ELEMENTS: {
      const equipmentToSave = setConnectedDataElements(
        state.saveState.data || state.equipment.data!,
        action.dataElements,
        action.currentDataElementId,
        action.detection,
        action.isApproved,
        action.isPrimary
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
  }

  return state;
}

export const AppProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer<Reducer<AppState, AppAction>>(
    reducer,
    initialState
  );

  useSaveEquipment(
    state.facility!,
    state.unitId,
    state.equipmentId,
    state.saveState.isInitial || false,
    state.saveState,
    dispatch
  );

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch} {...props} />
    </AppContext.Provider>
  );
};
