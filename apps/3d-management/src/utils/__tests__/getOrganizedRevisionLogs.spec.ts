import { revisionLogs } from '../../__fixtures__/revisionLogs';
import { getOrganizedRevisionLogs } from '../getOrganizedRevisionLogs';

describe('utils/getOrganizedRevisionLogs', () => {
  it('should return empty object if input logs are empty', () => {
    expect(getOrganizedRevisionLogs([])).toStrictEqual({});
  });
  const mockRevisionLog = {
    timestamp: expect.any(Number),
    type: expect.any(String),
  };
  it('should return correct results', () => {
    expect(getOrganizedRevisionLogs(revisionLogs)).toEqual(
      expect.objectContaining({
        '3d-optimizer': expect.arrayContaining([
          expect.objectContaining(mockRevisionLog),
        ]),
        'reveal-optimizer': expect.arrayContaining([
          expect.objectContaining(mockRevisionLog),
        ]),
        'walkable-path': expect.arrayContaining([
          expect.objectContaining(mockRevisionLog),
        ]),
        'unreal-optimizer': expect.arrayContaining([
          expect.objectContaining(mockRevisionLog),
        ]),
      })
    );
  });
});
