import {
  mockedPpfgSequenceUnwantedGeomechanicsSequence,
  mockedPpfgSequenceValidPpfgSequence,
  mockLotSequence,
  mockWellboreAssetIdReverseMap,
} from '__test-utils/fixtures/well';

import { cleanPpfgResults, processSequenceResponse } from '../measurements';

describe('Filter out unwanted geomechanics curves in the sequence. (cleanPpfgResults)', () => {
  it('should return true since data type is not ppfg', async () => {
    const result = cleanPpfgResults(
      mockedPpfgSequenceUnwantedGeomechanicsSequence,
      'lot'
    );
    expect(result).toBeTruthy();
  });

  it('should return false since sequence is a geomechanins', async () => {
    const result = cleanPpfgResults(
      mockedPpfgSequenceUnwantedGeomechanicsSequence,
      'ppfg'
    );
    expect(result).toBeFalsy();
  });

  it('should return true since sequence is a ppfg', async () => {
    const result = cleanPpfgResults(
      mockedPpfgSequenceValidPpfgSequence,
      'ppfg'
    );
    expect(result).toBeTruthy();
  });
});

describe('Should filter out geomechanics in ppfg result. (processSequenceResponse)', () => {
  it('Should not alter geomechanics sequence', async () => {
    const result = processSequenceResponse(
      [mockedPpfgSequenceUnwantedGeomechanicsSequence],
      mockWellboreAssetIdReverseMap,
      'geomechanic'
    );
    expect(result.length).toBe(1);
  });

  it('Should not alter LOT sequence', async () => {
    const result = processSequenceResponse(
      [mockLotSequence],
      mockWellboreAssetIdReverseMap,
      'lot'
    );
    expect(result.length).toBe(1);
  });

  it('Should filter out geomechanics from ppfg sequence', async () => {
    const result = processSequenceResponse(
      [
        mockedPpfgSequenceUnwantedGeomechanicsSequence,
        mockedPpfgSequenceValidPpfgSequence,
      ],
      mockWellboreAssetIdReverseMap,
      'ppfg'
    );
    expect(result.length).toBe(1);
  });
});
