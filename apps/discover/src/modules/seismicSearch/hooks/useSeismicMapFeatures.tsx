import { useMemo } from 'react';
import { useQueryClient } from 'react-query';

import { featureCollection } from '@turf/helpers';
import { SeismicError } from 'services/seismic';
import { SeismicGetData } from 'services/types';

import { getFeature } from 'modules/map/helper';
import {
  useSelectedSurveys,
  useSelectedFiles,
} from 'modules/seismicSearch/selectors';
import { isFileSelected } from 'modules/seismicSearch/utils';

import { getSurveyKey } from './useSurveys';

/*
 * This file complies all the features we need to show on the map for seismic
 *
 * It puts them into the format mapbox needs
 *
 * Here is the flow:
 *
 *
 * 1. get selected items from redux ui state
 *
 *  - eg: surveys and files
 *
 * 2. fetch the corrosponding data for their geometrys from the discover api
 *    and make the feature layers for them all:
 *
 *  selected surveys - grey
 *  selected files - grey
 *  unselected files - white
 *
 */
export const useSeismicMapFeatures = () => {
  // 1. these are the survey UI selections
  const selectedSurveyIds = useSelectedSurveys();
  const selectedFiles = useSelectedFiles();
  const queryClient = useQueryClient();

  // 2. add all opened surveys to the map
  const surveyFeatures = useMemo(
    () =>
      selectedSurveyIds.reduce<any[]>((result, id) => {
        const selectedSurveyData = queryClient.getQueryData<
          SeismicGetData | SeismicError
        >(getSurveyKey(id));

        if (!selectedSurveyData || 'error' in selectedSurveyData) {
          return result;
        }

        const { survey, files } = selectedSurveyData;
        // console.log('Adding survey:', survey);

        if (survey) {
          // add the outlines of each file
          // console.log('Checking files:', files);
          if (files?.length > 0) {
            files.forEach((file) => {
              // console.log('Processing file:', file);

              const state = isFileSelected(file.id, selectedFiles)
                ? 'Selected' // show dark outline and grey box
                : 'Preview'; // just show white outline (if not selected)
              // console.log('Survey state:', { file: file.id, state });

              if (file.geometry && 'coordinates' in file.geometry) {
                result.push({
                  id: file.id,
                  ...getFeature(file.geometry, state, file.id),
                });
              }
            });
          }

          // Main survey outline
          if (survey.geometry && 'coordinates' in survey.geometry) {
            result.push({
              id: survey.id,
              ...getFeature(
                {
                  ...survey.geometry,
                  tooltip: survey.name,
                },
                'Selected',
                survey.id
              ),
            });
          }
        }

        return result;
      }, []),
    [selectedSurveyIds, selectedFiles, queryClient]
  );

  // console.log('Final seismic features:', surveyFeatures);

  const seismicCollection = useMemo(
    () => featureCollection(surveyFeatures),
    [surveyFeatures]
  );
  return seismicCollection;
};
