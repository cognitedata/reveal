/*!
 * Copyright 2023 Cognite AS
 */

import { getApproximateProjectedBounds, getScreenArea } from '@reveal/utilities';
import assert from 'assert';
import minBy from 'lodash/minBy';
import pullAll from 'lodash/pullAll';
import { Node, PointOctant, PointOctree } from 'sparse-octree';
import { Box3, Matrix4, Vector3 } from 'three';
import { Image360Icon } from '../icons/Image360Icon';

export class IconOctree extends PointOctree<Image360Icon> {
  private readonly _nodeCenters: Map<Node, Image360Icon>;

  public static getMinimalOctreeBoundsFromIcons(icons: Image360Icon[]): Box3 {
    return new Box3().setFromPoints(icons.map(icon => icon.position));
  }

  constructor(icons: Image360Icon[], bounds: Box3, maxLeafSize: number) {
    super(bounds.min, bounds.max, 0, maxLeafSize);
    icons.forEach(icon => this.set(icon.position, icon));
    this.filterEmptyLeaves();
    this._nodeCenters = this.populateNodeCenters();
  }

  public getNodeMedianIcon(node: Node): Image360Icon | undefined {
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

  private populateNodeCenters(): Map<Node, Image360Icon> {
    const nodeCenters = new Map<Node, Image360Icon>();

    this.traverseLevelsBottomUp(nodes => {
      nodes.forEach(node => {
        if (this.hasData(node)) {
          nodeCenters.set(node, this.getMedianIcon(node.data.data));
        } else if (this.hasChildren(node)) {
          const icons = node.children!.map(child => nodeCenters.get(child)!);
          nodeCenters.set(node, this.getMedianIcon(icons));
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

  private getMedianIcon(icons: Image360Icon[]): Image360Icon {
    const center = icons
      .reduce((result, currentValue) => result.add(currentValue.position), new Vector3())
      .divideScalar(icons.length);

    const minDistanceIcon = minBy(icons, icon => icon.position.distanceToSquared(center));

    assert(minDistanceIcon !== undefined);

    return minDistanceIcon;
  }

  public traverseLevelsBottomUp(func: (nodes: Node[]) => void): void {
    const octreeDepth = this.getDepth();
    for (let i = octreeDepth; i >= 0; i--) {
      const level = this.findNodesByLevel(i);
      func(level);
    }
  }
}
