/*!
 * Copyright 2026 Cognite AS
 */
import { Mock } from 'moq.ts';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { BufferGeometry } from 'three';
import type { PointCloudMaterial } from '@reveal/rendering';
import type { IPointCloudTreeNode } from '../tree/IPointCloudTreeNode';
import { makeOnBeforeRender } from './utils';

describe('makeOnBeforeRender', () => {
  function createMaterial(): PointCloudMaterial {
    return {
      onBeforeRender: () => {},
      uniforms: {
        level: { value: 0 },
        isLeafNode: { value: false },
        keepFraction: { value: 1 },
        vnStart: { value: 0 },
        pcIndex: { value: 0 }
      },
      visibleNodeTextureOffsets: new Map(),
      uniformsNeedUpdate: false
    } as unknown as PointCloudMaterial;
  }

  test('forwards the node keepFraction to the keepFraction uniform', () => {
    const node = new Mock<IPointCloudTreeNode>()
      .setup(n => n.level)
      .returns(3)
      .setup(n => n.isLeafNode)
      .returns(true)
      .setup(n => n.keepFraction)
      .returns(0.35)
      .setup(n => n.name)
      .returns('r0')
      .object();

    const material = createMaterial();
    const onBeforeRender = makeOnBeforeRender(node, 0);

    onBeforeRender(
      new Mock<WebGLRenderer>().object(),
      new Mock<Scene>().object(),
      new Mock<Camera>().object(),
      new BufferGeometry(),
      material
    );

    expect(material.uniforms.keepFraction.value).toBe(0.35);
  });

  test('keeps a full keepFraction of 1 for nodes that are not being dithered', () => {
    const node = new Mock<IPointCloudTreeNode>()
      .setup(n => n.level)
      .returns(0)
      .setup(n => n.isLeafNode)
      .returns(false)
      .setup(n => n.keepFraction)
      .returns(1)
      .setup(n => n.name)
      .returns('r')
      .object();

    const material = createMaterial();
    const onBeforeRender = makeOnBeforeRender(node, 0);

    onBeforeRender(
      new Mock<WebGLRenderer>().object(),
      new Mock<Scene>().object(),
      new Mock<Camera>().object(),
      new BufferGeometry(),
      material
    );

    expect(material.uniforms.keepFraction.value).toBe(1);
  });
});
