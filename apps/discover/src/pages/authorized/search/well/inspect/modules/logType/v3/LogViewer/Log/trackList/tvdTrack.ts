import { DualScaleTrack, scaleLegendConfig } from '@cognite/videx-wellog';

import { LogData } from '../interfaces';

const TVDTrack = (trackId: number, logData: LogData) => {
  if (!logData.TVD) return null;
  const tvdTrack = new DualScaleTrack(trackId, {
    maxWidth: 50,
    width: 2,
    label: 'TVD',
    abbr: 'TVD',
    units: logData.TVD.unit,
    mode: 1,
    legendConfig: scaleLegendConfig,
  });
  return tvdTrack;
};

export default TVDTrack;
