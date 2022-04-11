import { FILTER_NAMES, MODULES } from './constants';
import {
  SearchInput,
  MultiSelect,
  NumericRange,
  SelectedMap,
  Errors,
  SET_FILTER_VALUES,
  SET_SELECTED_ID_MAP,
  SET_ERRORS,
  RESET_ERRORS,
} from './types';

// NDS
export const setNdsRiskType = (values: MultiSelect) => {
  const filter = {
    filterModule: MODULES.nds,
    filterName: FILTER_NAMES.riskType,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};
export const setNdsProbability = (values: MultiSelect) => {
  const filter = {
    filterModule: MODULES.nds,
    filterName: FILTER_NAMES.probability,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};
export const setNdsSeverity = (values: MultiSelect) => {
  const filter = {
    filterModule: MODULES.nds,
    filterName: FILTER_NAMES.severity,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};

// NPT
export const setNptCode = (values: MultiSelect) => {
  const filter = {
    filterModule: MODULES.npt,
    filterName: FILTER_NAMES.nptCode,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};
export const setNptDetailCode = (values: MultiSelect) => {
  const filter = {
    filterModule: MODULES.npt,
    filterName: FILTER_NAMES.nptDetailCode,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};
export const setNptSearchPhrase = (values: SearchInput) => {
  const filter = {
    filterModule: MODULES.npt,
    filterName: FILTER_NAMES.searchPhrase,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};
export const setNptDuration = (values: NumericRange) => {
  const filter = {
    filterModule: MODULES.npt,
    filterName: FILTER_NAMES.duration,
  };
  return { type: SET_FILTER_VALUES, filter, values };
};

export const setSelectedLogIds = (values: SelectedMap) => {
  const filter = {
    filterModule: MODULES.log,
    filterName: FILTER_NAMES.selectedIds,
  };
  return { type: SET_SELECTED_ID_MAP, filter, values };
};

// trajectory
export const setSelectedTrajIds = (values: SelectedMap) => {
  const filter = {
    filterModule: MODULES.trajectory,
    filterName: FILTER_NAMES.selectedIds,
  };
  return { type: SET_SELECTED_ID_MAP, filter, values };
};
export const setSelectedTrajectoryWellboreIds = (values: SelectedMap) => {
  const filter = {
    filterModule: MODULES.trajectory,
    filterName: FILTER_NAMES.selectedWellboreIds,
  };
  return { type: SET_SELECTED_ID_MAP, filter, values };
};

// Errors
export const setErrors = (values: Errors) => {
  return { type: SET_ERRORS, filter: {}, values };
};

export const resetErrors = () => {
  return { type: RESET_ERRORS };
};

export const inspectTabsActions = {
  setNdsRiskType,
  setNdsProbability,
  setNdsSeverity,
  setNptCode,
  setNptDetailCode,
  setNptSearchPhrase,
  setNptDuration,
  setSelectedLogIds,
  setSelectedTrajIds,
  setSelectedTrajectoryWellboreIds,
  setErrors,
  resetErrors,
};
