import { useSelectedSurveys } from 'modules/seismicSearch/selectors';

import { useSurvey } from './useSurveys';

/*
 * Get the current survey from the UI state
 * and return it's data object.
 *
 */
export const useSelectedSurvey = () => {
  const selectedSurveyIds = useSelectedSurveys();

  return useSurvey(selectedSurveyIds?.[0]);
};
