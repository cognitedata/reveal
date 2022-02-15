import { useDispatch } from 'react-redux';

import { SeismicSurvey } from 'services/types';

import { Geometry } from '@cognite/seismic-sdk-js';

import { zoomToFeature } from 'modules/map/actions';
import { SeismicSurveyContainer } from 'modules/seismicSearch/types';

export const useZoomToSurvey = () => {
  const dispatch = useDispatch();

  const zoomToSurvey = (survey: SeismicSurveyContainer | SeismicSurvey) => {
    if (survey.geometry) {
      dispatch(zoomToFeature(survey.geometry as Geometry));
    }
  };

  return zoomToSurvey;
};
