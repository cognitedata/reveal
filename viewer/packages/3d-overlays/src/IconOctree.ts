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

  private readonly _distanceBoxChecker = {
    box: new Box3(),
    vector: new Vector3()
  };

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

  /**
   * Get all icons from a node's subtree recursively
   * @param node - The octree node to get icons from
   * @returns Array of Overlay3DIcons contained in the node's subtree
   */
  public getAllIconsFromNode(node: Node): Overlay3DIcon<ContentType>[] {
    if (this.hasData(node) && node.data) {
      return node.data.data as Overlay3DIcon<ContentType>[];
    }
    if (this.hasChildren(node) && node.children) {
      return node.children.flatMap(child => (this.isPointOctant(child) ? this.getAllIconsFromNode(child) : []));
    }
    return [];
  }

  /**
   * Check if a node or any of its descendants exists in the given set
   * @param node - The octree node to check
   * @param nodeSet - Set of nodes to check against
   * @returns True if the node or any descendant is in the set, false otherwise
   */
  public hasDescendantInSet(node: Node, nodeSet: Set<Node>): boolean {
    if (nodeSet.has(node)) {
      return true;
    }
    if (!this.hasChildren(node) || !node.children) {
      return false;
    }
    return node.children.some(child => this.hasDescendantInSet(child, nodeSet));
  }

  /**
   * Get LOD nodes based on projected screen area.
   * Nodes with projected area above the threshold are expanded,
   * while those below are selected as LOD representatives.
   * @param areaThreshold - Screen area threshold (0 to 1) for LOD selection
   * @param projection - View projection matrix
   * @param minimumLevel - Minimum octree level to expand to (default: 0)
   * @returns Set of PointOctant nodes selected for LOD based on screen area
   */
  public getLODByScreenArea(
    areaThreshold: number,
    projection: Matrix4,
    minimumLevel = 0
  ): Set<PointOctant<Overlay3DIcon>> {
    const root = this.findNodesByLevel(0)[0];
    const selectedNodes = new Set<PointOctant<Overlay3DIcon>>();

    if (!this._nodeCenters.has(root)) {
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

  /**
   * Get LOD nodes based purely on camera distance.
   * This provides consistent behavior regardless of view angle.
   * @param cameraPosition - Camera position in model space
   * @param distanceThreshold - Distance from camera within which all icons are shown (no clustering)
   * @param clusteringLevel - The octree level at which to cluster far icons (higher = finer clusters)
   * @returns Set of PointOctant nodes selected for LOD based on distance
   */
  public getLODByDistance(
    cameraPosition: Vector3 | undefined,
    distanceThreshold: number,
    clusteringLevel = 2
  ): Set<PointOctant<Overlay3DIcon>> {
    const root = this.findNodesByLevel(0)[0];
    const selectedNodes = new Set<PointOctant<Overlay3DIcon>>();

    if (!this._nodeCenters.has(root)) {
      return selectedNodes;
    }

    const nodesToProcess: Array<{ node: Node; depth: number }> = [{ node: root, depth: 0 }];

    for (const element of nodesToProcess) {
      const { node: currentNode, depth } = element;

      if (!this.isPointOctant(currentNode)) {
        continue;
      }

      if (!this.hasChildren(currentNode) && this.hasData(currentNode)) {
        selectedNodes.add(currentNode);
        continue;
      }

      const hasIconsWithinDistance =
        cameraPosition === undefined || this.isNodeWithinDistance(currentNode, cameraPosition, distanceThreshold);

      if (hasIconsWithinDistance) {
        currentNode.children?.forEach(child => {
          if (this.isPointOctant(child)) {
            nodesToProcess.push({ node: child, depth: depth + 1 });
          }
        });
      } else {
        if (depth < clusteringLevel && this.hasChildren(currentNode)) {
          currentNode.children?.forEach(child => {
            if (this.isPointOctant(child)) {
              nodesToProcess.push({ node: child, depth: depth + 1 });
            }
          });
        } else {
          selectedNodes.add(currentNode);
        }
      }
    }

    return selectedNodes;
  }

  /**
   * Get LOD nodes based on camera distance with enhanced clustering for pure cluster visualization.
   * Uses node size awareness and max depth control for better cluster granularity.
   * @param cameraPosition - Camera position for distance calculation
   * @param distanceThreshold - Distance threshold for "close" icons
   * @param maxOctreeDepth - Maximum octree depth to expand to (controls cluster granularity)
   * @returns Set of PointOctant nodes selected for LOD based on camera distance
   */
  public getLODByDistanceWithClustering(
    cameraPosition: Vector3 | undefined,
    distanceThreshold: number,
    maxOctreeDepth?: number
  ): Set<PointOctant<Overlay3DIcon>> {
    const root = this.findNodesByLevel(0)[0];
    const selectedNodes = new Set<PointOctant<Overlay3DIcon>>();

    if (!this._nodeCenters.has(root)) {
      return selectedNodes;
    }

    const nodesToProcess: Node[] = [root];

    for (const element of nodesToProcess) {
      const currentNode = element;

      if (!this.isPointOctant(currentNode)) {
        continue;
      }

      if (!this.hasChildren(currentNode) && this.hasData(currentNode)) {
        selectedNodes.add(currentNode);
        continue;
      }

      const nodeSize = this.getNodeSize(currentNode);
      const nodeDistanceThreshold = distanceThreshold + nodeSize;
      const hasIconsWithinDistance =
        cameraPosition === undefined || this.isNodeWithinDistance(currentNode, cameraPosition, nodeDistanceThreshold);

      const nodeMetadata = this._nodeCenters.get(currentNode);
      const currentLevel = nodeMetadata?.level ?? 0;

      // If the node is at the maximum depth, it will not be expanded further
      const isAtMaxDepth = maxOctreeDepth !== undefined && currentLevel >= maxOctreeDepth;

      const isCameraCloseToNode =
        cameraPosition !== undefined && this.isNodeWithinDistance(currentNode, cameraPosition, distanceThreshold);

      if (isCameraCloseToNode) {
        if (currentNode.children) {
          for (const child of currentNode.children) {
            if (this.isPointOctant(child)) {
              nodesToProcess.push(child);
            }
          }
        } else {
          selectedNodes.add(currentNode);
        }
      } else if (hasIconsWithinDistance && !isAtMaxDepth) {
        currentNode.children?.forEach(child => {
          if (this.isPointOctant(child)) {
            nodesToProcess.push(child);
          }
        });
      } else {
        selectedNodes.add(currentNode);
      }
    }

    return selectedNodes;
  }

  /**
   * Get the diagonal size of a node's bounding box
   */
  private getNodeSize(node: Node): number {
    const size = new Vector3();
    size.subVectors(node.max, node.min);
    return size.length();
  }

  /**
   * Get all icons from a node's subtree that are within the given distance from a point.
   * Also returns the representative icon if no close icons are found (for clustering).
   * @param node - The octree node to get icons from
   * @param cameraPosition - Camera position for distance calculation
   * @param distanceThreshold - Distance threshold for "close" icons
   * @returns Object containing close icons and whether to show representative
   */
  public getIconsFromClusteredNode(
    node: Node,
    cameraPosition: Vector3,
    distanceThreshold: number
  ): Overlay3DIcon<ContentType | DefaultOverlay3DContentType>[] {
    const closeIcons: Overlay3DIcon<ContentType>[] = [];
    const allIcons = this.getAllIconsFromNode(node);

    for (const icon of allIcons) {
      if (cameraPosition.distanceTo(icon.getPosition()) <= distanceThreshold) {
        closeIcons.push(icon);
      }
    }

    if (closeIcons.length > 0) {
      return closeIcons;
    }
    const representativeIcon = this.getNodeIcon(node);
    return representativeIcon ? [representativeIcon] : [];
  }

  /**
   * Check if any icon in the node's subtree is within the given distance from a point
   * @param node - The octree node to check
   * @param point - The point to measure distance from
   * @param distance - Distance threshold
   * @returns True if any icon is within distance, false otherwise
   */
  private isNodeWithinDistance(node: Node, point: Vector3, distance: number): boolean {
    this._distanceBoxChecker.box.set(node.min, node.max);
    const closestPointOnBox = this._distanceBoxChecker.box.clampPoint(point, this._distanceBoxChecker.vector);
    const distanceToBox = point.distanceTo(closestPointOnBox);

    if (distanceToBox > distance) {
      return false;
    }

    const nodeMetadata = this._nodeCenters.get(node);
    if (nodeMetadata && point.distanceTo(nodeMetadata.icon.getPosition()) <= distance) {
      return true;
    }

    if (this.hasData(node) && node.data) {
      return node.data.data.some((icon: Overlay3DIcon) => point.distanceTo(icon.getPosition()) <= distance);
    }

    if (this.hasChildren(node)) {
      return node.children!.some(child => this.isNodeWithinDistance(child, point, distance));
    }

    return false;
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
