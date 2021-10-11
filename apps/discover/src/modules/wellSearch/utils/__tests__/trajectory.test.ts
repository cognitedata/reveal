import { useSelector } from 'react-redux';

import { mockedTrajectoryData } from '__test-utils/fixtures/trajectory';
import {
  mockedSequencesResultFixture,
  mockedWellStateFixture,
} from '__test-utils/fixtures/well';

import { findIndexByName, mapWellInfo } from '../trajectory';

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
    const index = findIndexByName('Depth', mockedTrajectoryData, {
      Depth: 'Depth',
    });
    expect(index).toEqual(0);

    const invalidIndex = findIndexByName('Invalid', mockedTrajectoryData, {
      Depth: 'Depth',
    });
    expect(invalidIndex).toEqual(-1);
  });
});
