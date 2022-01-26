const MODEL_DETAILS = 'ModelDetails';
const CALCUATION_LIST = 'CalculationsList';
const VERSION_DETAILS = 'VersionDetails';

export const TRACKING_EVENTS = {
  MODEL_DETAILS_VIEW: `${MODEL_DETAILS}.View`,
  MODEL_CALC_LIST: `${MODEL_DETAILS}.${CALCUATION_LIST}`,
  MODEL_CACL_CONFIG: `${MODEL_DETAILS}.${CALCUATION_LIST}.Configure`,
  MODEL_CALC_EDIT: `${MODEL_DETAILS}.${CALCUATION_LIST}.EditConfiguration`,
  NEW_MODEL_VERSION: `${MODEL_DETAILS}.NewModelVersion`,
  MODEL_VERSION_DEAILS: `${MODEL_DETAILS}.${VERSION_DETAILS}`,
  MODEL_VERSION_DOWNLOAD: `${MODEL_DETAILS}.VersionDetails.Download`,
  NEW_MODEL: 'CreateNewModel',
};

type TrackingEventKeys = keyof typeof TRACKING_EVENTS;
export type TrackingEventNames = typeof TRACKING_EVENTS[TrackingEventKeys];
