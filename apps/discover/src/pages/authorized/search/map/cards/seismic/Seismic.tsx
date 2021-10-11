import React from 'react';

import mapboxgl from 'maplibre-gl';

import { useSelectedSurvey } from 'modules/seismicSearch/hooks/useSelectedSurvey';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';

import { MapPreviewContainer } from '../CardContainer';

import SeismicPreviewCard from './components/SeismicPreviewCard';

interface Props {
  map?: mapboxgl.Map;
}
export const SeismicCard: React.FC<Props> = ({ map }) => {
  const { data: selectedSurveyData } = useSelectedSurvey();
  const selectedFiles = useSelectedFiles();
  const selectedFileIds = selectedFiles.map((file) => file.fileId);

  if (map && selectedSurveyData) {
    if ('error' in selectedSurveyData || !selectedSurveyData.files) {
      return null;
    }

    return (
      <MapPreviewContainer
        map={map}
        // if we want to show card at right location:
        // coordinates={selectedSurveyData.survey.geometry)}
      >
        <SeismicPreviewCard
          seismicFiles={selectedSurveyData.files.filter((file) => {
            return selectedFileIds.includes(file.id);
          })}
        />
      </MapPreviewContainer>
    );
  }

  return null;
};
