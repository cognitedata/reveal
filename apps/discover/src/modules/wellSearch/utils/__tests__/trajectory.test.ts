import { useSelector } from 'react-redux';

import { AngleUnitEnum, DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import {
  getMockedTrajectoryData,
  mockedTrajectoryDataV3,
} from '__test-utils/fixtures/trajectory';
import {
  mockedSequencesResultFixture,
  mockedWellStateFixture,
} from '__test-utils/fixtures/well';

import { findIndexByName, mapWellInfo, mapMetadataUnit } from '../trajectory';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('Trajectory utils', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateFixture);
    });
  });
  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
  });

  it(`should set well info to trajectories`, () => {
    const mappedSequences = mapWellInfo(
      mockedSequencesResultFixture,
      mockedWellStateFixture.wellSearch.wells
    );
    expect(mappedSequences[0].metadata?.wellName).toEqual('16/1');
    expect(mappedSequences[0].metadata?.wellboreName).toEqual(
      'wellbore B desc'
    );
  });

  it(`should set well name as empty to trajectories if well not found`, () => {
    const mappedSequences = mapWellInfo(
      mockedSequencesResultFixture,
      mockedWellStateFixture.wellSearch.wells
    );
    expect(mappedSequences[1].metadata?.wellName).toEqual('');
  });

  it(`should find index by name`, () => {
    const index = findIndexByName('Depth', getMockedTrajectoryData(), {
      Depth: 'Depth',
    });
    expect(index).toEqual(0);

    const invalidIndex = findIndexByName('Invalid', getMockedTrajectoryData(), {
      Depth: 'Depth',
    });
    expect(invalidIndex).toEqual(-1);
  });

  it('should return correct unit with trajectory data type', () => {
    const unitOfTVD = mapMetadataUnit(
      { name: 'tvd' },
      mockedTrajectoryDataV3()
    );
    const unitOfMD = mapMetadataUnit({ name: 'md' }, mockedTrajectoryDataV3());
    const unitOfInclination = mapMetadataUnit(
      { name: 'inclination' },
      mockedTrajectoryDataV3()
    );
    const unitOfAzimuth = mapMetadataUnit(
      { name: 'azimuth' },
      mockedTrajectoryDataV3()
    );

    const unitOfED = mapMetadataUnit(
      { name: 'equivalent_departure' },
      mockedTrajectoryDataV3()
    );

    const unitOfXOffset = mapMetadataUnit(
      { name: 'x_offset' },
      mockedTrajectoryDataV3()
    );

    const unitOfYOffset = mapMetadataUnit(
      { name: 'y_offset' },
      mockedTrajectoryDataV3()
    );

    expect(unitOfTVD).toEqual(DistanceUnitEnum.Meter);
    expect(unitOfMD).toEqual(DistanceUnitEnum.Meter);
    expect(unitOfInclination).toEqual(AngleUnitEnum.Degree);
    expect(unitOfAzimuth).toEqual(AngleUnitEnum.Degree);
    expect(unitOfED).toEqual(DistanceUnitEnum.Meter);
    expect(unitOfXOffset).toEqual(DistanceUnitEnum.Meter);
    expect(unitOfYOffset).toEqual(unitOfXOffset);
  });
});
