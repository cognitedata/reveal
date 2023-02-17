/*!
 * Copyright 2023 Cognite AS
 */

import { EventTrigger, getBox3CornerPoints } from '@reveal/utilities';
import clamp from 'lodash/clamp';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { PointOctree, OctreeHelper, Node } from 'sparse-octree';
import {
  Vector3,
  Box3,
  WebGLRenderer,
  Camera,
  Box2,
  Matrix4,
  Vector2,
  Group,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial
} from 'three';

export class Image360CollectionIconsOctree {
  private _camera: Camera | undefined;
  private readonly _group: Group;
  private readonly _octree: PointOctree<void>;
  constructor(points: Vector3[], onRender: EventTrigger<(renderer: WebGLRenderer, camera: Camera) => void>) {
    this._octree = this.createOctreeFromPoints(points);
    const viewProjectionMatrix = new Matrix4();
    this._group = new Group();
    this._group.add(new OctreeHelper(this._octree));
    const boxes = this.createVisualizationBoxes();
    this._group.add(boxes);
    onRender.subscribe((_, camera) => {
      this._camera = camera;
      viewProjectionMatrix.copy(this._camera.projectionMatrix).multiply(this._camera.matrixWorldInverse);
      const root = this._octree.findNodesByLevel(0)[0];
      const selectedLODs = this.selectGroupingLOD(root, 0.05, viewProjectionMatrix);
      console.log(selectedLODs.size);
      boxes.children.forEach(p => (p.visible = false));
      let c = 0;
      selectedLODs.forEach(node => {
        const box = boxes.children[c];
        node.getCenter(box.position);
        box.visible = true;
        c++;
      });
    });
  }

  public getVisualizationHelper(): Group {
    return this._group;
  }

  private createVisualizationBoxes(): Group {
    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshBasicMaterial({ color: 'red' });
    const boxGroup = new Group();
    for (let i = 0; i < 1000; i++) {
      boxGroup.add(new Mesh(geometry, material));
    }
    return boxGroup;
  }

  private selectGroupingLOD(root: Node, threshold: number, viewProjectionMatrix: Matrix4): Set<Node> {
    const nodesToProcess: Node[] = [];
    const selectedNodes = new Set<Node>();

    if (root.children === undefined || root.children.length === 0) {
      selectedNodes.add(root);
      return selectedNodes;
    }

    nodesToProcess.push(root);

    while (nodesToProcess.length > 0) {
      const currentNode = nodesToProcess.shift()!;
      if (currentNode.children === null || currentNode.children === undefined || currentNode.children.length === 0) {
        selectedNodes.add(currentNode);
        continue;
      }

      currentNode.children.forEach(node => {
        const rootProjectedBounds = this.getApproximateBoxProjectedBounds(
          new Box3(node.min, node.max),
          viewProjectionMatrix
        );
        const screenArea = this.getScreenArea(rootProjectedBounds);
        if (screenArea >= threshold) {
          nodesToProcess.push(node);
        } else {
          selectedNodes.add(currentNode);
        }
      });
    }
    return selectedNodes;
  }

  private createOctreeFromPoints(points: Vector3[]): PointOctree<void> {
    const [min, max] = getPointExtents(points);
    const octree = new PointOctree<void>(min, max, 0, 16);
    points.forEach(p => octree.set(p));
    return octree;

    function getPointExtents(points: Vector3[]) {
      const box = new Box3().setFromPoints(points);
      return [box.min, box.max];
    }
  }

  private getScreenArea(projectedBounds: Box2): number {
    const clampedMinX = clamp(projectedBounds.min.x * 0.5 + 0.5, 0, 1);
    const clampedMinY = clamp(projectedBounds.min.y * 0.5 + 0.5, 0, 1);

    const clampedMaxX = clamp(projectedBounds.max.x * 0.5 + 0.5, 0, 1);
    const clampedMaxY = clamp(projectedBounds.max.y * 0.5 + 0.5, 0, 1);

    return (clampedMaxX - clampedMinX) * (clampedMaxY - clampedMinY);
  }

  private getApproximateBoxProjectedBounds(box: Box3, viewProjectionMatrix: Matrix4): Box2 {
    const corners = getBox3CornerPoints(box);

    corners.forEach(corner => corner.applyMatrix4(viewProjectionMatrix));

    const xMin = minBy(corners, corner => corner.x / corner.w)!;
    const yMin = minBy(corners, corner => corner.y / corner.w)!;

    const xMax = maxBy(corners, corner => corner.x / corner.w)!;
    const yMax = maxBy(corners, corner => corner.y / corner.w)!;

    return new Box2(new Vector2(xMin.x / xMin.w, yMin.y / yMin.w), new Vector2(xMax.x / xMax.w, yMax.y / yMax.w));
  }
}
