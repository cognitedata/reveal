/*!
 * Copyright 2026 Cognite AS
 */

import { Box3, BufferGeometry, Float32BufferAttribute, Points, Vector3, WebGLRenderTarget } from 'three';
import type { SimpleTestFixtureComponents } from '../../../visual-tests/test-fixtures/SimpleVisualTestFixture';
import { SimpleVisualTestFixture } from '../../../visual-tests/test-fixtures/SimpleVisualTestFixture';
import { assert } from '@reveal/utilities/assert';
import { PointCloudMaterial, PointShape, PointSizeType } from '../src/pointcloud-rendering';

export default class AdaptivePointSizeVisualTest extends SimpleVisualTestFixture {
  private readonly _geometry = new BufferGeometry();
  private readonly _materials = [
    new PointCloudMaterial(),
    new PointCloudMaterial({ maxSize: 10 }),
    new PointCloudMaterial({ size: 10 })
  ];

  public async setup({ renderer, scene, camera }: SimpleTestFixtureComponents): Promise<void> {
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    camera.fov = 60;
    camera.updateProjectionMatrix();

    this._geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    this._geometry.setAttribute('color', new Float32BufferAttribute([1, 1, 1], 3));
    this._geometry.setAttribute('classification', new Float32BufferAttribute([0], 1));
    this._geometry.setAttribute('objectId', new Float32BufferAttribute([0], 1));
    this._materials[2].pointSizeType = PointSizeType.Fixed;

    const depths = [8, 3, 1.75, 0.5];
    const slope = Math.tan((camera.fov * Math.PI) / 360);
    for (const [row, material] of this._materials.entries()) {
      material.shape = PointShape.Square;
      material.updateMaterial(
        {
          scale: new Vector3(1, 1, 1),
          spacing: 0.01,
          boundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
        },
        new Uint8Array(4),
        camera
      );
      for (const [column, depth] of depths.entries()) {
        const points = new Points(this._geometry, material);
        points.position.set(
          ((column - 1.5) / 2) * depth * slope * camera.aspect,
          (0.5 - row / 2) * depth * slope,
          -depth
        );
        scene.add(points);
      }
    }

    // Rows compare Adaptive, an explicit maximum of 10, and Fixed as the same point spacing approaches.
    const { width, height } = renderer.domElement;
    const target = new WebGLRenderTarget(width, height);
    const readWidth = async (row: number, column: number) => {
      const pixels = new Uint8Array(64 * 4);
      await renderer.readRenderTargetPixelsAsync(
        target,
        Math.round(((column + 0.5) * width) / 4) - 32,
        Math.round((0.75 - row / 4) * height),
        64,
        1,
        pixels
      );
      return pixels.filter((value, index) => index % 4 === 0 && value > 0).length;
    };
    try {
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      const widths: number[][] = [];
      for (let row = 0; row < 3; row++) {
        const rowWidths: number[] = [];
        for (let column = 0; column < depths.length; column++) {
          rowWidths.push(await readWidth(row, column));
        }
        widths.push(rowWidths);
      }
      assert(widths[0][0] > 0, 'The point-size fixture must render visible points');
      assert(
        widths[0][0] === widths[1][0] && widths[0][1] === widths[1][1],
        'Explicit maximum sizes must not enlarge distant points'
      );
      assert(
        widths[0][2] > widths[1][2] && widths[0][3] > widths[0][2],
        'Nearby Adaptive points must grow beyond the old cap'
      );
      assert(Math.abs(widths[0][3] - (32 * height) / 1080) <= 1, 'Close-up growth must stop at the new cap');
      assert(
        widths[2].every(width => width === widths[2][0]),
        'Fixed sizes must not depend on distance'
      );
      this._materials[0].spacing = 0.1;
      renderer.render(scene, camera);
      for (const [column, cap] of [6, 6, 19, 32].entries()) {
        assert(
          Math.abs((await readWidth(0, column)) - (cap * height) / 1080) <= 1,
          'Coarse Adaptive points must follow the distance-dependent cap, including its midpoint'
        );
      }
      this._materials[0].minSize = 20;
      renderer.render(scene, camera);
      assert(
        Math.abs((await readWidth(0, 0)) - (20 * height) / 1080) <= 1,
        'The distance-dependent cap must respect an explicit minimum'
      );
    } finally {
      this._materials[0].spacing = 0.01;
      this._materials[0].minSize = 1;
      renderer.setRenderTarget(null);
      target.dispose();
    }
  }

  public override dispose(): void {
    this._geometry.dispose();
    this._materials.forEach(material => material.dispose());
    super.dispose();
  }
}
