import { Sequence } from '@cognite/sdk';

import { sequence } from '__test-utils/fixtures/log';
import { getMockSequenceData } from '__test-utils/fixtures/trajectory';
import { SequenceData } from 'modules/wellSearch/types';

import {
  getFilteredPPFGsData,
  getIntersectCurves,
  getUniquePressureCurves,
  getUniqueTypes,
  getWellboreIdNameMap,
  getCheckboxItemMap,
} from './utils';

describe('Multiple ppfg viewer utils', () => {
  it('should return intersect curves', () => {
    expect(getIntersectCurves(['A', 'b'], ['B'])).toEqual(['b']);
  });

  it('should return wellbore id and name map', () => {
    const sequences: Sequence[] = [
      {
        ...sequence,
        assetId: 1,
        metadata: {
          wellboreName: 'Test Wellbore Name',
        },
      },
    ];
    expect(getWellboreIdNameMap(sequences)).toEqual({
      '1': 'Test Wellbore Name',
    });
  });

  it('should return wellbore id and checkbox item map', () => {
    const sequences = [
      {
        ...sequence,
        assetId: 1,
        metadata: {
          wellboreName: 'Test Wellbore Name',
          wellboreDescription: 'Test Wellbore Description',
        },
      },
    ];
    expect(getCheckboxItemMap(sequences)).toEqual([
      { key: 'Test Wellbore Name', text: 'Test Wellbore Description' },
    ]);
  });

  it('should return unique types', () => {
    const sequencesData = [
      {
        sequence: {
          ...sequence,
          assetId: 1,
          metadata: {
            wellboreName: 'Test Wellbore Name',
          },
          description: 'Test Type',
        },
      },
    ];
    const selectedFilters = {
      wellbores: ['Test Wellbore Name'],
    };
    expect(getUniqueTypes(sequencesData, selectedFilters)).toEqual([
      'Test Type',
    ]);
  });

  it('should return unique pressure curves', () => {
    const sequencesData: SequenceData[] = [
      {
        sequence: {
          ...sequence,
          assetId: 1,
          metadata: {
            wellboreName: 'Test Wellbore Name',
          },
          description: 'Test Type',
          columns: [
            getMockSequenceData({ valueType: 'DOUBLE', name: 'Curve A' }),
          ],
        },
      },
      {
        sequence: {
          ...sequence,
          assetId: 1,
          metadata: {
            wellboreName: 'Test Wellbore Name 2',
          },
          description: 'Test Type 2',
          columns: [
            getMockSequenceData({ valueType: 'DOUBLE', name: 'Curve B' }),
            getMockSequenceData({ valueType: 'DOUBLE', name: 'Curve A' }),
            getMockSequenceData({
              valueType: 'DOUBLE',
              name: 'Curve A',
              metadata: {
                unit: 'ft',
              },
            }),
          ],
        },
      },
    ];
    expect(getUniquePressureCurves(sequencesData)).toEqual([
      'Curve A',
      'Curve B',
    ]);
  });

  it('should return filtered ppfg data', () => {
    const sequencesData = [
      {
        sequence: {
          ...sequence,
          assetId: 1,
          metadata: {
            wellboreName: 'Test Wellbore Name',
          },
          description: 'Test Type',
        },
      },
      {
        sequence: {
          ...sequence,
          assetId: 1,
          metadata: {
            wellboreName: 'Test Wellbore Name 2',
          },
          description: 'Test Type 2',
        },
      },
    ];
    const selectedFilters = {
      wellbores: ['Test Wellbore Name'],
      ppfgTypes: ['Test Type'],
      uniqTypes: ['Test Type'],
    };
    expect(getFilteredPPFGsData(sequencesData, selectedFilters)).toEqual([
      sequencesData[0],
    ]);
  });
});
