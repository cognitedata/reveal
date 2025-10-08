import { type PointOfInterest } from '../../../../src/architecture';
import { PointsOfInterestStatus } from '../../../../src/architecture/concrete/pointsOfInterest/types';

export function createPointOfInterestMock(params?: { id?: string }): PointOfInterest<string> {
  return {
    properties: {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      name: 'a-name',
      scene: { externalId: 'a-scene-external-id', space: 'a-space' },
      sceneState: {}
    },
    id: params?.id ?? 'an-id',
    status: PointsOfInterestStatus.Default
  };
}
