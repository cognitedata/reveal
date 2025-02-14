/*!
 * Copyright 2023 Cognite AS
 */

import { getApproximateProjectedBounds, getScreenArea } from '@reveal/utilities';
import assert from 'assert';
import minBy from 'lodash/minBy';
import pullAll from 'lodash/pullAll';
import { Node, PointOctant, PointOctree } from 'sparse-octree';
import { Box3, Matrix4, Vector3 } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { DefaultOverlay3DContentType } from './OverlayCollection';

type NodeMetadata = {
  icon: Overlay3DIcon;
  level: number;
};

export class IconOctree<ContentType = DefaultOverlay3DContentType> extends PointOctree<Overlay3DIcon<ContentType>> {
  private readonly _nodeCenters: Map<Node, NodeMetadata>;

  public static getMinimalOctreeBoundsFromIcons<ContentType>(icons: Overlay3DIcon<ContentType>[]): Box3 {
    return new Box3().setFromPoints(icons.map(icon => icon.getPosition()));
  }

  constructor(icons: Overlay3DIcon<ContentType>[], bounds: Box3, maxLeafSize: number) {
    super(bounds.min, bounds.max, 0, maxLeafSize);
    icons.forEach(icon => this.set(icon.getPosition(), icon));
    this.filterEmptyLeaves();
    this._nodeCenters = this.populateNodeCenters();
  }

  public getNodeIcon(node: Node): Overlay3DIcon | undefined {
    const nodeMetadata = this._nodeCenters.get(node);
    assert(nodeMetadata !== undefined);
    return nodeMetadata.icon;
  }

  public getLODByScreenArea(
    areaThreshold: number,
    projection: Matrix4,
    minimumLevel = 0
  ): Set<PointOctant<Overlay3DIcon>> {
    const root = this.findNodesByLevel(0)[0];
    const selectedNodes = new Set<PointOctant<Overlay3DIcon>>();

    if (root === undefined) {
      return selectedNodes;
    }

    const nodesToProcess = [root];

    while (nodesToProcess.length > 0) {
      const currentNode = nodesToProcess.shift()!;
      const currentNodeLevel = this._nodeCenters.get(currentNode)!.level;
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
        if (currentNodeLevel <= minimumLevel) {
          nodesToProcess.push(child);
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

  private populateNodeCenters(): Map<Node, NodeMetadata> {
    const nodeCenters = new Map<Node, NodeMetadata>();

    let level = this.getDepth();
    this.traverseLevelsBottomUp(nodes => {
      nodes.forEach(node => {
        if (this.hasData(node) && node.data) {
          nodeCenters.set(node, { icon: this.getClosestToAverageIcon(node.data.data), level });
        } else if (this.hasChildren(node)) {
          const icons = node.children!.map(child => nodeCenters.get(child)!.icon);
          nodeCenters.set(node, { icon: this.getClosestToAverageIcon(icons), level });
        }
      });
      level--;
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

  private hasData(node: Node): node is PointOctant<Overlay3DIcon> {
    return this.isPointOctant(node) && node.data !== null;
  }

  private isPointOctant(node: Node): node is PointOctant<Overlay3DIcon> {
    return node instanceof PointOctant;
  }

  private getClosestToAverageIcon(icons: Overlay3DIcon[]): Overlay3DIcon {
    const center = icons
      .reduce((result, currentValue) => result.add(currentValue.getPosition()), new Vector3())
      .divideScalar(icons.length);

    const minDistanceIcon = minBy(icons, icon => icon.getPosition().distanceToSquared(center));

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
