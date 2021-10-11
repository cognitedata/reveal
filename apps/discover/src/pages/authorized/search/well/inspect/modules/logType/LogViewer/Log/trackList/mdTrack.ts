import {
  DualScaleTrack,
  scaleLegendConfig,
  ScaleTrack,
} from '@cognite/videx-wellog';

import { LogData } from '../interfaces';

const MDTrack = (trackId: number, logData: LogData) => {
  const mdTrack = logData.TVD
    ? new DualScaleTrack(trackId, {
        maxWidth: 50,
        width: 2,
        label: 'MD',
        abbr: 'MD',
        units: logData.MD.unit,
        mode: 0,
        legendConfig: scaleLegendConfig,
      })
    : new ScaleTrack(trackId, {
        maxWidth: 50,
        width: 2,
        label: 'MD',
        abbr: 'MD',
        units: logData.MD.unit,
        legendConfig: scaleLegendConfig,
      });
  return mdTrack;
};

export default MDTrack;
