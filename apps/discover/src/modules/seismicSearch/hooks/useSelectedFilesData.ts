import { useSelectedFiles } from 'modules/seismicSearch/selectors';

import { useSurvey } from './useSurveys';

// note: didn't end up using this one, but might need it
// so keep around for a while.

/*
 * Get the currently selected files from the UI state
 * and return their data objects.
 *
 */
export const useSurveyDataByCurrentlySelectedFiles = () => {
  const selectedFilesIds = useSelectedFiles();

  if (selectedFilesIds.length === 0) {
    return { data: { files: [], surveys: [] } };
  }

  // assumption here is that all files will be in the same survey!
  return useSurvey(selectedFilesIds[0].surveyId);
};
