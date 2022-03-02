import get from 'lodash/get';

import { GraphTrack, graphLegendConfig } from '@cognite/videx-wellog';
import { PlotConfig } from '@cognite/videx-wellog/dist/tracks/graph/interfaces';

import { TRACK_CONFIG } from 'modules/wellSearch/constants';
import { NO_LOGS_LEGEND_MESSAGE } from 'pages/authorized/search/well/inspect/constants';

import { LogData } from '../interfaces';

// This returns track configurations
const GraphTrackConfig = (
  trackId: number,
  trackName: string,
  logData: LogData
) => {
  const plots = TRACK_CONFIG.filter((row) => row.trackId === trackName).map(
    (row) => ({
      id: row.name,
      type: 'line',
      options: {
        scale: row.scale,
        width: row.width,
        color: row.color,
        dash: row.dash,
        filterToScale: false,
        domain: get(logData, `${row.name}.domain`, [0, 0]),
        dataAccessor: (d: LogData) => get(d, `${row.name}.values`, []),
        legendInfo: (d: LogData) => ({
          label: `${row.name} (${get(
            d,
            `${row.name}.unit`,
            NO_LOGS_LEGEND_MESSAGE
          )})`,
        }),
      },
    })
  ) as PlotConfig[];

  return new GraphTrack(trackId, {
    label: trackName,
    abbr: trackName,
    data: logData,
    legendConfig: graphLegendConfig,
    plots,
  });
};

export default GraphTrackConfig;
