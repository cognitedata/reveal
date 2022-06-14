/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { PointCloudOctreePickerHelper, RenderedNode } from "./PointCloudOctreePickerHelper";
import { Potree, PointCloudOctree, PointCloudMaterial } from '../../potree-three-loader';
import { Mock } from 'moq.ts';

describe('PointCloudOctreePickerHelper', () => {

  test('findHit() returns point data from pixel buffer with 1 non-zero value', () => {
    const dummyOctree: PointCloudOctree = new Mock<PointCloudOctree>()
      .setup(p => p.isObject3D)
      .returns(true)
      .setup(p => p.parent)
      .returns(null)
      .setup(p => p.dispatchEvent)
      .returns((_: any) => {})
      .setup(p => p.material)
      .returns(new PointCloudMaterial())
      .object();

    const dummyNode: RenderedNode = new Mock<RenderedNode>().object();

    const pickWindowSize = 2;
    // 2x2 pixel buffer with 1 non-zero value and two "kinds" of zero values (with 0 and 1 alpha)
    const dummyPixels: Uint8Array = new Uint8Array(
        [1,0,0,2, 0,0,0,255, 
         0,0,0,255, 0,0,0, 0]
        );
    const dummyCamera = new THREE.PerspectiveCamera();
    dummyCamera.position.set(1, 0, 0);
    
    jest.spyOn(PointCloudOctreePickerHelper, 'getPointPosition')
    .mockImplementation((_nodes, _pcIndex, _pIndex) => {
        return new THREE.Vector3();
    });

    expect(PointCloudOctreePickerHelper.findHit(dummyPixels, pickWindowSize, [dummyNode], dummyCamera)).toBe({ })
  });
});
