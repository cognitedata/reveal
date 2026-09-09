/*!
 * Copyright 2026 Cognite AS
 */

import { Box3, BufferGeometry, DepthTexture, Float32BufferAttribute, Points, Vector3, WebGLRenderTarget } from 'three';
import type { SimpleTestFixtureComponents } from '../../../visual-tests/test-fixtures/SimpleVisualTestFixture';
import { SimpleVisualTestFixture } from '../../../visual-tests/test-fixtures/SimpleVisualTestFixture';
import { assert } from '@reveal/utilities/assert';
import { PointCloudMaterial, PointSizeType } from '../src/pointcloud-rendering';

export default class EdgeAwarePointSizeVisualTest extends SimpleVisualTestFixture {
  private readonly _materials = [new PointCloudMaterial(), new PointCloudMaterial()];
  private readonly _geometries: BufferGeometry[] = [];
  private readonly _reference = new WebGLRenderTarget(1, 1, { depthTexture: new DepthTexture(1, 1) });

  public async setup({ renderer, scene, camera }: SimpleTestFixtureComponents): Promise<void> {
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    camera.fov = 60;
    camera.updateProjectionMatrix();
    const { width, height } = renderer.domElement;
    const slope = Math.tan(Math.PI / 6);

    for (const [column, material] of this._materials.entries()) {
      const positions: number[] = [];
      const colors: number[] = [];
      const addPoint = (x: number, y: number, depth: number, color: number[]) => {
        positions.push(
          ((x + column * 640) / 640 - 1) * depth * slope * camera.aspect,
          (1 - y / 360) * depth * slope,
          -depth
        );
        colors.push(...color);
      };
      for (let x = 130; x <= 490; x += 6) {
        for (let y = 100; y <= 340; y += 6) {
          addPoint(x, y, 4, [0, 0.25, 0.8]);
        }
      }
      for (let x = 160; x <= 460; x += 6) {
        for (let y = 130; y <= 310; y += 6) {
          addPoint(x, y, 2, [0.8, 0.8, 0.8]);
        }
        for (let y = 430; y <= 442; y += 6) {
          addPoint(x, y, 2, [1, 0.7, 0]);
        }
        addPoint(x, 520, 2, [1, 0.7, 0]);
      }
      addPoint(310, 650, 2, [1, 1, 1]);

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
      geometry.setAttribute('classification', new Float32BufferAttribute(new Float32Array(positions.length / 3), 1));
      geometry.setAttribute('objectId', new Float32BufferAttribute(new Float32Array(positions.length / 3), 1));
      this._geometries.push(geometry);
      material.updateMaterial(
        {
          scale: new Vector3(1, 1, 1),
          spacing: 0.1,
          boundingBox: new Box3(new Vector3(-10, -10, -10), new Vector3(10, 10, 10))
        },
        new Uint8Array(4),
        camera
      );
      scene.add(new Points(geometry, material));
    }

    // Left: distance-only sizing. Right: a depth edge, rail silhouette and isolated point with edge-aware sizing.
    this._reference.setSize(width, height);
    renderer.setRenderTarget(this._reference);
    renderer.render(scene, camera);
    this._materials[1].edgeDepthTexture = this._reference.depthTexture;

    const target = new WebGLRenderTarget(width, height);
    try {
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      const pixels = new Uint8Array(width * height * 4);
      await renderer.readRenderTargetPixelsAsync(target, 0, 0, width, height, pixels);
      const occupied = (x: number, y: number) => pixels[4 * ((height - 1 - y) * width + x)] > 128;
      const countColumn = (column: number, top: number, bottom: number, position: number = 310) => {
        let count = 0;
        const x = Math.round(((position + column * 640) * width) / 1280);
        for (let y = Math.round((top * height) / 720); y < Math.round((bottom * height) / 720); y++) {
          if (occupied(x, y)) count++;
        }
        return count;
      };
      assert(
        countColumn(1, 100, 340) < countColumn(0, 100, 340),
        'Foreground outlines at depth discontinuities must shrink'
      );
      assert(countColumn(1, 400, 470) <= 0.8 * countColumn(0, 400, 470), 'Rail outlines must shrink');
      assert(
        countColumn(1, 490, 550) <= 0.85 * countColumn(0, 490, 550),
        'Rails narrower than a splat must also shrink'
      );
      assert(
        countColumn(1, 490, 550, 160) <= 0.85 * countColumn(0, 490, 550, 160),
        'Thin rail endings must not retain oversized caps'
      );
      assert(countColumn(1, 620, 680) === countColumn(0, 620, 680), 'Isolated points must not be mistaken for edges');
      for (let y = Math.round((150 * height) / 720); y < Math.round((290 * height) / 720); y++) {
        assert(occupied(Math.round((950 * width) / 1280), y), 'Surface interiors must stay filled');
      }
      for (const type of [PointSizeType.Fixed, PointSizeType.Attenuated]) {
        this._materials.forEach(material => {
          material.pointSizeType = type;
          material.maxSize = 32;
          material.size = 32;
        });
        renderer.render(scene, camera);
        await renderer.readRenderTargetPixelsAsync(target, 0, 0, width, height, pixels);
        assert(countColumn(1, 100, 340) === countColumn(0, 100, 340), 'Non-Adaptive surface sizes must stay unchanged');
        assert(countColumn(1, 400, 470) === countColumn(0, 400, 470), 'Non-Adaptive rail sizes must stay unchanged');
      }
      this._materials.forEach(material => {
        material.pointSizeType = PointSizeType.Adaptive;
        material.size = 1;
        material.minSize = 32;
      });
      renderer.render(scene, camera);
      await renderer.readRenderTargetPixelsAsync(target, 0, 0, width, height, pixels);
      assert(countColumn(1, 400, 470) === countColumn(0, 400, 470), 'Edge sizing must respect the minimum size');
      this._materials.forEach(material => {
        material.minSize = 1;
      });
    } finally {
      renderer.setRenderTarget(null);
      target.dispose();
    }
  }

  public override dispose(): void {
    this._materials.forEach(material => material.dispose());
    this._geometries.forEach(geometry => geometry.dispose());
    this._reference.dispose();
    super.dispose();
  }
}
