import { DATA_SETS_MAP } from 'domain/reportManager/internal/constants';

export const SET_WELL_FEEDBACK = 'SET_WELL_FEEDBACK';

export type WellFeedback = {
  visible: boolean;
  wellboreMatchingId?: string;
  dataSet?: keyof typeof DATA_SETS_MAP;
};

export interface SetWellFeedback {
  type: typeof SET_WELL_FEEDBACK;
  payload: WellFeedback;
}

export interface ReportManagerState {
  wellFeedback: WellFeedback;
}

export type ReportManagerAction = SetWellFeedback;
