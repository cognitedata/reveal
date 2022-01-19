import { BPData } from "@/Solutions/BP/BPData";
import { mapMetadataKeys, MetadataKeyMapping, WellboreMetadata } from "@/Solutions/BP/MetadataTransform";
import { well, mappedWellbore } from './subsurface.mock';

describe('BPData', () => {
  test('should add wells to the data structure', () => {
    const data = new BPData({
      wells: [well],
      wellBores: [],
      trajectories: []
    });
    const expectWellsMap = new Map();

    expectWellsMap.set(well.id, well);

    expect(data.wellMap).toEqual(expectWellsMap);
  });
  test('should add wellbores with transformed metadata', () => {
    const mapping: MetadataKeyMapping<WellboreMetadata> = {
      elevation_type: 'e_type',
      elevation_value: 'e_value',
      elevation_value_unit: 'e_value_unit',
    };
    const data = new BPData({
        wells: [well],
        // @ts-ignore
        wellBores: [mappedWellbore],
        trajectories: []
      },
      {
      wellbore: {
        datasource: wellboreData => mapMetadataKeys(mapping, wellboreData)
      }
    });
    const { data: { metadata } } = data.wellBoreToWellMap.get(mappedWellbore.id)!;

    expect(metadata.elevation_type).toEqual(mappedWellbore.metadata.e_type);
    expect(metadata.elevation_value).toEqual(mappedWellbore.metadata.e_value);
    expect(metadata.elevation_value_unit).toEqual(mappedWellbore.metadata.e_value_unit);
  });
  test('should not add wellbore with invalid metadata', () => {
    const data = new BPData({
        wells: [well],
        // @ts-ignore
        wellBores: [mappedWellbore],
        trajectories: []
      });
    expect(data.wellBoreToWellMap.size).toEqual(0);
  });
});