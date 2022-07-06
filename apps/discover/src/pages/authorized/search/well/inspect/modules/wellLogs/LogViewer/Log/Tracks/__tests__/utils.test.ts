import {
  getMockLogDataForMDColumn,
  getMockLogDataForTVDColumn,
  mdBasedLogData,
  tvdBasedLogData,
} from '__test-utils/fixtures/wellLogs';

import { WellLogNdsEventsData } from '../../types';
import {
  convertEventsDataToArray,
  getCategorizedLogData,
  getTrackConfig,
} from '../utils';

describe('LogViewer -> Log -> utils', () => {
  describe('getTrackConfig', () => {
    it('should return exact track config when passed measurement type exists in track config', () => {
      const measurementType = 'gamma ray';
      const trackConfig = getTrackConfig(measurementType);
      expect(trackConfig?.measurementType).toEqual(measurementType);
    });

    it('should return matching track config when passed measurement type is not exactly same', () => {
      const measurementType = 'gamma ray data density';
      const matchingConfigMeasurementType = 'gamma ray';
      const trackConfig = getTrackConfig(measurementType);
      expect(trackConfig?.measurementType).toEqual(
        matchingConfigMeasurementType
      );
    });

    it('should return undefined when passed measurement type or matching one does not exist at all', () => {
      const measurementType = 'measurment type which does not exist or match';
      const trackConfig = getTrackConfig(measurementType);
      expect(trackConfig).toBeUndefined();
    });
  });

  describe('getCategorizedLogData', () => {
    it('should categorize log data', () => {
      const logData = {
        ...getMockLogDataForMDColumn(),
        ...getMockLogDataForTVDColumn(),
        ...mdBasedLogData,
        ...tvdBasedLogData,
      };
      const {
        gammaRayAndCaliperData,
        resistivityData,
        densityAndNeutronData,
        geomechanicsAndPPFGData,
      } = getCategorizedLogData(logData);

      expect(Object.keys(gammaRayAndCaliperData)).toEqual([
        'gamma ray',
        'caliper',
      ]);
      expect(Object.keys(resistivityData)).toEqual([
        'deep resistivity',
        'medium resistivity',
        'micro resistivity',
        'shallow resistivity',
      ]);
      expect(Object.keys(densityAndNeutronData)).toEqual([
        'density',
        'neutron porosity',
      ]);
      expect(Object.keys(geomechanicsAndPPFGData)).toEqual([
        'pore pressure',
        'fracture pressure',
        'geomechanics',
      ]);
    });
  });

  describe('convertEventsDataToArray', () => {
    it('should filter events data and convert to array', () => {
      const eventsData: WellLogNdsEventsData[] = [
        { holeStartValue: 0, holeEndValue: 100 },
        { holeStartValue: 10, holeEndValue: 90, riskType: 'riskType' },
      ];
      expect(convertEventsDataToArray(eventsData)).toEqual([
        [10, 'riskType', 90],
      ]);
    });
  });
});
