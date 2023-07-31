import isEmpty from 'lodash/isEmpty';

import { PlotConfig } from '@cognite/videx-wellog/dist/tracks/graph/interfaces';

import { WellLogPreviewData } from '../types';

export const updateRanges = (logData: WellLogPreviewData, tracks: any[]) => {
  if (isEmpty(tracks)) {
    return;
  }

  Object.keys(logData).forEach((columnExternalId) => {
    tracks.forEach((track) => {
      if (!track.plots || !track.setPlotOption || !track.legendUpdate) {
        return;
      }

      track.plots.forEach((plot: PlotConfig) => {
        if (
          plot.id === columnExternalId &&
          JSON.stringify(logData[columnExternalId].domain) !==
            JSON.stringify(plot.options.domain)
        ) {
          track.setPlotOption(
            columnExternalId,
            'domain',
            logData[columnExternalId].domain
          );
          track.legendUpdate();
        }
      });
    });
  });
};
