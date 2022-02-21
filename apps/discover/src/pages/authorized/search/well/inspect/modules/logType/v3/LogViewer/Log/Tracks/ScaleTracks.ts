import {
  BlockScaleTrack,
  DualScaleTrack,
  scaleLegendConfig,
} from '@cognite/videx-wellog';

import { EventData } from '../interfaces';

import {
  convertEventsDataToArray,
  setNdsEventsBlocksTitle,
  setupElementsAppenderOnTrack,
} from './utils';

export const getMDScaleTrack = (unit: string) => {
  return new DualScaleTrack('MD_SCALE_TRACK', {
    maxWidth: 50,
    width: 2,
    label: 'MD',
    abbr: 'MD',
    units: unit,
    mode: 0,
    legendConfig: scaleLegendConfig,
  });
};

export const getTVDScaleTrack = (unit: string) => {
  return new DualScaleTrack('TVD_SCALE_TRACK', {
    maxWidth: 50,
    width: 2,
    label: 'TVD',
    abbr: 'TVD',
    units: unit,
    mode: 1,
    legendConfig: scaleLegendConfig,
  });
};

export const getNDSScaleTrack = (eventsData: EventData[], unit: string) => {
  const ndsTrack = new BlockScaleTrack('NDS_SCALE_TRACK', {
    maxWidth: 50,
    width: 2,
    label: 'NDS',
    units: unit,
    data: convertEventsDataToArray(eventsData),
    legendConfig: scaleLegendConfig,
  });

  setupElementsAppenderOnTrack(ndsTrack, setNdsEventsBlocksTitle);
  return ndsTrack;
};
