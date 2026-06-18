/*!
 * Copyright 2026 Cognite AS
 */

import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

import type { SimpleTestFixtureComponents } from '../../../visual-tests';
import { SimpleVisualTestFixture } from '../../../visual-tests';

export const renderer = 'webgpu' as const;

export default class WebGpuSmokeVisualTest extends SimpleVisualTestFixture {
  public async setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { scene, camera } = simpleTestFixtureComponents;

    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0088ff }));
    scene.add(mesh);

    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
  }
}
