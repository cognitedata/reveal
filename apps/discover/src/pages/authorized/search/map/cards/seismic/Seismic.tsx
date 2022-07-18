import React from 'react';

import { Map } from 'maplibre-gl';

import { useMap } from 'modules/map/selectors';
import { useSelectedSurvey } from 'modules/seismicSearch/hooks/useSelectedSurvey';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';

import { MapPreviewContainer } from '../CardContainer';

import SeismicPreviewCard from './components/SeismicPreviewCard';

interface Props {
  map?: Map;
}
export const SeismicCard: React.FC<Props> = ({ map }) => {
  const { data: selectedSurveyData } = useSelectedSurvey();
  const selectedFiles = useSelectedFiles();
  const { drawMode } = useMap();

  if (drawMode !== 'draw_polygon' && map && selectedSurveyData) {
    if ('error' in selectedSurveyData || !selectedSurveyData.files) {
      return null;
    }

    const selectedFileIds = selectedFiles.map((file) => file.fileId);

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
