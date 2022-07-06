import { WellLogNdsEventsData } from '../../types';
import {
  getMDScaleTrack,
  getNDSScaleTrack,
  getTVDScaleTrack,
} from '../ScaleTracks';
import * as utils from '../utils';

describe('ScaleTracks', () => {
  const setupElementsAppenderOnTrack = jest.spyOn(
    utils,
    'setupElementsAppenderOnTrack'
  );

  describe('getMDScaleTrack', () => {
    it('should return MD scale track', () => {
      const mdScaleTrack = getMDScaleTrack('ft');
      expect(mdScaleTrack).toBeTruthy();
    });
  });

  describe('getTVDScaleTrack', () => {
    it('should return TVD scale track', () => {
      const tvdScaleTrack = getTVDScaleTrack('ft');
      expect(tvdScaleTrack).toBeTruthy();
    });
  });

  describe('getNDSScaleTrack', () => {
    it('should return NDS scale track and call block title setter', () => {
      const eventsData: WellLogNdsEventsData[] = [
        { holeStartValue: 0, holeEndValue: 100 },
      ];
      const ndsScaleTrack = getNDSScaleTrack(eventsData, 'ft');

      expect(ndsScaleTrack).toBeTruthy();
      expect(setupElementsAppenderOnTrack).toBeCalledTimes(1);
    });
  });
});
