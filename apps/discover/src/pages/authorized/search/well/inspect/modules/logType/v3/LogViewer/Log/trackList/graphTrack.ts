import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells-v3';
import { GraphTrack, graphLegendConfig } from '@cognite/videx-wellog';
import { PlotConfig } from '@cognite/videx-wellog/dist/tracks/graph/interfaces';

import { NO_LOGS_LEGEND_MESSAGE } from 'pages/authorized/search/well/inspect/constants';

import { TRACK_CONFIG } from '../../../trackConfig';
import { TrackNameEnum } from '../../../trackConfig/constants';
import { LogData } from '../interfaces';
import { getRandomTrackColor } from '../utils/trackColorizer';

const keyedTrackConfig = keyBy(TRACK_CONFIG, 'measurementType');
const trackConfigMeasurementTypes = Object.keys(keyedTrackConfig);

// This returns track configurations
const GraphTrackConfig = (
  trackId: number,
  trackName: string,
  logData: LogData
) => {
  const plots = Object.keys(logData)
    .filter((columnExternalId) => {
      const { measurementType } = logData[columnExternalId];
      const isDepthColumnType = Object.values(DepthIndexTypeEnum).includes(
        measurementType as DepthIndexTypeEnum
      );

      if (trackName === TrackNameEnum.PPFG && !isDepthColumnType) {
        return true;
      }

      const trackConfig =
        keyedTrackConfig[measurementType] ||
        getMatchingTrackConfig(measurementType);

      return trackConfig && trackConfig.trackName === trackName;
    })
    .map<PlotConfig>((columnExternalId) => {
      const { measurementType, domain } = logData[columnExternalId];
      const trackConfig = keyedTrackConfig[measurementType];

      return {
        id: columnExternalId,
        type: 'line',
        options: {
          scale: trackConfig?.scale || 'linear',
          width: trackConfig?.width,
          color: trackConfig?.color || getRandomTrackColor(),
          dash: trackConfig?.dash,
          filterToScale: false,
          domain,
          dataAccessor: (data: LogData) =>
            get(data, `${columnExternalId}.values`, []),
          legendInfo: (data: LogData) => ({
            label: `${columnExternalId} (${get(
              data,
              `${columnExternalId}.unit`,
              NO_LOGS_LEGEND_MESSAGE
            )})`,
          }),
        },
      };
    });

  if (isEmpty(plots)) {
    return null;
  }

  return new GraphTrack(trackId, {
    label: trackName,
    abbr: trackName,
    data: logData,
    legendConfig: graphLegendConfig,
    plots,
  });
};

const getMatchingTrackConfig = (requiredMeasurementType: string) => {
  const matchingMeasurementType = trackConfigMeasurementTypes.find(
    (measurementType) => requiredMeasurementType.includes(measurementType)
  );
  return matchingMeasurementType
    ? keyedTrackConfig[matchingMeasurementType]
    : {};
};

export default GraphTrackConfig;
