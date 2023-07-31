import * as React from 'react';

import { MapAddedProps, drawModes } from '@cognite/react-map';

import { useSelectedSurvey } from 'modules/seismicSearch/hooks/useSelectedSurvey';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';

import { MapPreviewContainer } from '../CardContainer';

import SeismicPreviewCard from './components/SeismicPreviewCard';

export const SeismicCard: React.FC<MapAddedProps> = ({ map, drawMode }) => {
  const { data: selectedSurveyData } = useSelectedSurvey();
  const selectedFiles = useSelectedFiles();

  if (drawMode !== drawModes.DRAW_POLYGON && map && selectedSurveyData) {
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
