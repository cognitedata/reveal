import { Mock } from 'moq.ts';
import {
  type SceneConfiguration,
  type Scene,
  type SceneQualitySettings
} from '../../../src/components/SceneContainer/sceneTypes';

export function createSceneMockWithQualitySettings(
  qualitySettings?: Partial<SceneQualitySettings> | null
): Scene | null {
  if (qualitySettings === null) {
    return null;
  }

  return new Mock<Scene>()
    .setup((s) => s.sceneConfiguration)
    .returns(
      new Mock<SceneConfiguration>()
        .setup((sc) => sc.name)
        .returns('Test Scene')
        .setup((sc) => sc.cameraTranslationX)
        .returns(0)
        .setup((sc) => sc.cameraTranslationY)
        .returns(0)
        .setup((sc) => sc.cameraTranslationZ)
        .returns(10)
        .setup((sc) => sc.cameraEulerRotationX)
        .returns(0)
        .setup((sc) => sc.cameraEulerRotationY)
        .returns(0)
        .setup((sc) => sc.cameraEulerRotationZ)
        .returns(0)
        .setup((sc) => sc.cameraTargetX)
        .returns(0)
        .setup((sc) => sc.cameraTargetY)
        .returns(0)
        .setup((sc) => sc.cameraTargetZ)
        .returns(0)
        .setup((sc) => sc.updatedAt)
        .returns('2024-01-01T00:00:00Z')
        .setup((sc) => sc.qualitySettings)
        .returns(qualitySettings)
        .object()
    )
    .setup((s) => s.skybox)
    .returns(undefined)
    .setup((s) => s.groundPlanes)
    .returns([])
    .setup((s) => s.sceneModels)
    .returns([])
    .setup((s) => s.image360Collections)
    .returns([])
    .object();
}
