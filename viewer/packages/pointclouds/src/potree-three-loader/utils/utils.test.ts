/*!
 * Copyright 2026 Cognite AS
 */
import { It, Mock } from 'moq.ts';
import type { WebGLRenderer } from 'three';
import { BufferGeometry, PerspectiveCamera, Scene, Vector2 } from 'three';
import { PointCloudMaterial } from '@reveal/rendering';
import type { IPointCloudTreeNode } from '../tree/IPointCloudTreeNode';
import { makeOnBeforeRender } from './utils';

describe(makeOnBeforeRender.name, () => {
  const renderer = new Mock<WebGLRenderer>()
    .setup(r => r.getDrawingBufferSize(It.IsAny()))
    .returns(new Vector2(100, 100))
    .object();

  function createNode(keepFraction: number): IPointCloudTreeNode {
    return new Mock<IPointCloudTreeNode>()
      .setup(node => node.level)
      .returns(3)
      .setup(node => node.isLeafNode)
      .returns(true)
      .setup(node => node.name)
      .returns('r0')
      .setup(node => node.keepFraction)
      .returns(keepFraction)
      .object();
  }

  function renderNode(node: IPointCloudTreeNode, material: PointCloudMaterial): void {
    makeOnBeforeRender(node, 0)(renderer, new Scene(), new PerspectiveCamera(), new BufferGeometry(), material);
  }

  test('forwards the node keepFraction to the material uniform', () => {
    const material = new PointCloudMaterial();

    renderNode(createNode(0.35), material);

    expect(material.uniforms.keepFraction.value).toBe(0.35);
  });

  test('keeps the full keepFraction of 1 for nodes that are not dithered', () => {
    const material = new PointCloudMaterial();

    renderNode(createNode(1), material);

    expect(material.uniforms.keepFraction.value).toBe(1);
  });
});
