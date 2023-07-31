import { BPData } from 'Solutions/BP/BPData';
import {
  mapMetadataKeys,
  MetadataKeyMapping,
  WellboreMetadata,
} from 'Solutions/BP/MetadataTransform';
import { well, mappedWellbore } from '__mocks__/subsurface.mock';
import { bpCasings } from '__mocks__/bpCasings.mock';
import { bpNdsEvents } from '__mocks__/bpNdsEvents.mock';
import { bpNptEvents } from '__mocks__/bpNptEvents.mock';

describe('BPData', () => {
  const originalConsole = global.console;

  beforeEach(() => {
    global.console.warn = jest.fn();
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  describe('Wells', () => {
    test('should add wells to the data structure', () => {
      const data = new BPData({
        wells: [well],
        wellBores: [],
        trajectories: [],
      });
      const expectWellsMap = new Map();

      expectWellsMap.set(well.id, well);

      expect(data.wellMap).toEqual(expectWellsMap);
    });
  });

  describe('Wellbores', () => {
    test('should add wellbores with transformed metadata', () => {
      const mapping: MetadataKeyMapping<WellboreMetadata> = {
        elevation_type: 'e_type',
        elevation_value: 'e_value',
        elevation_value_unit: 'e_value_unit',
      };
      const data = new BPData(
        {
          wells: [well],
          // @ts-ignore
          wellBores: [mappedWellbore],
          trajectories: [],
        },
        {
          wellbore: {
            datasource: (wellboreData) =>
              mapMetadataKeys(mapping, wellboreData),
          },
        }
      );
      const {
        data: { metadata },
      } = data.wellBoreToWellMap.get(mappedWellbore.id)!;

      expect(metadata.elevation_type).toEqual(mappedWellbore.metadata.e_type);
      expect(metadata.elevation_value).toEqual(mappedWellbore.metadata.e_value);
      expect(metadata.elevation_value_unit).toEqual(
        mappedWellbore.metadata.e_value_unit
      );
    });
    test('should not add wellbore with invalid metadata', () => {
      const data = new BPData({
        wells: [well],
        // @ts-ignore
        wellBores: [mappedWellbore],
        trajectories: [],
      });
      expect(data.wellBoreToWellMap.size).toEqual(0);
    });
  });

  describe('Casings', () => {
    test('should give warnings about orphan casings', () => {
      const data = new BPData({
        wells: [well],
        wellBores: [],
        trajectories: [],
        casings: bpCasings,
      });

      expect(data).toBeTruthy();
      expect(global.console.warn).toBeCalledTimes(7);
    });
  });

  describe('NDS', () => {
    test('should give warnings about orphan nds', () => {
      const data = new BPData({
        wells: [well],
        wellBores: [],
        trajectories: [],
        ndsEvents: bpNdsEvents,
      });

      expect(data).toBeTruthy();
      expect(global.console.warn).toBeCalledTimes(22);
    });
  });

  describe('NPT', () => {
    test('should give warnings about orphan npt', () => {
      const data = new BPData({
        wells: [well],
        wellBores: [],
        trajectories: [],
        nptEvents: bpNptEvents,
      });

      expect(data).toBeTruthy();
      expect(global.console.warn).toBeCalledTimes(19);
    });
  });
});
