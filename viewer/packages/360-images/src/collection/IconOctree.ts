/*!
 * Copyright 2023 Cognite AS
 */

import { getApproximateProjectedBounds, getScreenArea } from '@reveal/utilities';
import pullAll from 'lodash/pullAll';
import { Node, PointOctant, PointOctree } from 'sparse-octree';
import { Box3, Matrix4, Vector3 } from 'three';
import { Image360Icon } from '../entity/Image360Icon';

export class IconOctree extends PointOctree<Image360Icon> {
  private readonly _nodeCenters: Map<Node, Vector3>;

  public static getMinimalOctreeBoundsFromIcons(icons: Image360Icon[]): Box3 {
    return new Box3().setFromPoints(icons.map(icon => icon.position));
  }

  constructor(icons: Image360Icon[], bounds: Box3, maxLeafSize: number) {
    super(bounds.min, bounds.max, 0, maxLeafSize);
    icons.forEach(icon => this.set(icon.position, icon));
    this.filterEmptyLeaves();
    this._nodeCenters = this.populateNodeCenters();
  }

  public getPointCenterOfNode(node: Node): Vector3 | undefined {
    return this._nodeCenters.get(node);
  }

  public getLODByScreenArea(areaThreshold: number, projection: Matrix4): Set<PointOctant<Image360Icon>> {
    const root = this.findNodesByLevel(0)[0];
    const selectedNodes = new Set<PointOctant<Image360Icon>>();

    const nodesToProcess = [root];

    while (nodesToProcess.length > 0) {
      const currentNode = nodesToProcess.shift()!;
      if (!this.isPointOctant(currentNode)) {
        continue;
      }
      if (!this.hasChildren(currentNode) && this.hasData(currentNode)) {
        selectedNodes.add(currentNode);
        continue;
      }
      currentNode.children?.forEach(child => {
        if (!this.isPointOctant(child)) {
          return;
        }
        const projectedArea = computeNodeProjectedArea(child);
        if (projectedArea > areaThreshold) {
          nodesToProcess.push(child);
        } else {
          selectedNodes.add(currentNode);
        }
      });
    }

    return selectedNodes;

    function computeNodeProjectedArea(node: Node) {
      const rootProjectedBounds = getApproximateProjectedBounds(new Box3(node.min, node.max), projection);
      return getScreenArea(rootProjectedBounds);
    }
  }

  private populateNodeCenters(): Map<Node, Vector3> {
    const nodeCenters = new Map<Node, Vector3>();

    this.traverseLevelsBottomUp(nodes => {
      nodes.forEach(node => {
        if (this.hasData(node)) {
          nodeCenters.set(node, this.centerOfPoints(node.data.points));
        } else if (this.hasChildren(node)) {
          const points = node.children!.map(child => nodeCenters.get(child)!);
          nodeCenters.set(node, this.centerOfPoints(points));
        }
      });
    });

    return nodeCenters;
  }

  private filterEmptyLeaves() {
    const emptyNodes = new Set<Node>();
    this.traverseLevelsBottomUp(nodes => {
      nodes.forEach(node => {
        if (this.hasChildren(node)) {
          pullAll(
            node.children!,
            node.children!.filter(child => emptyNodes.has(child))
          );
        }
      });
      nodes.filter(node => this.isEmptyLeaf(node)).forEach(node => emptyNodes.add(node));
    });
  }

  private hasChildren(node: Node) {
    return node.children !== null && node.children !== undefined && node.children.length > 0;
  }

  private isEmptyLeaf(node: Node) {
    return node.children === null && !this.hasData(node);
  }

  private hasData(node: Node): node is PointOctant<Image360Icon> {
    return this.isPointOctant(node) && node.data !== null;
  }

  private isPointOctant(node: Node): node is PointOctant<Image360Icon> {
    return node instanceof PointOctant;
  }

  private centerOfPoints(points: Vector3[]): Vector3 {
    return points.reduce((result, currentValue) => result.add(currentValue), new Vector3()).divideScalar(points.length);
  }

  private traverseLevelsBottomUp(func: (nodes: Node[]) => void) {
    const octreeDepth = this.getDepth();
    for (let i = octreeDepth; i >= 0; i--) {
      const level = this.findNodesByLevel(i);
      func(level);
    }
  }
}
