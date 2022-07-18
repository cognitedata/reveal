import { ElementNode, parse } from 'svg-parser';
import { kdTree } from 'kd-tree-javascript';

import { parseStyleString } from '../utils';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  Rect,
  SvgRepresentation,
  DiagramSymbolInstance,
  DiagramType,
  PidFileConnectionInstance,
  DiagramInstanceId,
  PathReplacement,
  DiagramInstanceWithPaths,
} from '../types';
import { findLinesAndConnections } from '../findLinesAndConnections';
import {
  getSceenCTMToSvgMatrix,
  svgCommandsToPathSegments,
} from '../geometry/svgPathParser';
import { findAllInstancesOfSymbol } from '../matcher';
import { BoundingBox, PathSegment, Point } from '../geometry';
import {
  AUTO_ANALYSIS_LABEL_THRESHOLD_ISO,
  AUTO_ANALYSIS_LABEL_THRESHOLD_PID,
} from '../constants';
import { traverse } from '../graph/traversal';

import { calculatePidPathsBoundingBox, createSvgRepresentation } from './utils';
import { PidTspan } from './PidTspan';
import { PidPath } from './PidPath';
import { PidGroup } from './PidGroup';
import { getFileConnectionsWithPosition } from './fileConnectionUtils';
import parseLineConnectionTags from './parseLineConnectionTags';
import parseLineNumbersWithUnit from './parseLineNumbersWithUnit';

export type LabelInstanceConnection = {
  labelId: string;
  labelText: string;
  instanceId: DiagramInstanceId;
};

export type KdTreePidPath = kdTree<PidPathPoint>;

export interface PidPathPoint {
  x: number;
  y: number;
  pathSegment: PathSegment;
  index: number;
  pathId: string;
  isFilled: boolean;
}

const distance = (a: PidPathPoint, b: PidPathPoint) => {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
};

const pidPathsToKdTree = (pidPaths: PidPath[]): KdTreePidPath => {
  const points = pidPaths.flatMap((pidPath) => {
    return pidPath.segmentList.map((pathSegment, index) => {
      const { midPoint } = pathSegment;
      const pidPathPoint: PidPathPoint = {
        x: midPoint.x,
        y: midPoint.y,
        pathSegment,
        index,
        pathId: pidPath.pathId,
        isFilled: pidPath.isFilled(),
      };
      return pidPathPoint;
    });
  });

  // eslint-disable-next-line new-cap
  return new kdTree<PidPathPoint>(points, distance, ['x', 'y']);
};

export class PidDocument {
  pidPaths: PidPath[];
  pidLabels: PidTspan[];
  viewBox: Rect;
  kdTree: KdTreePidPath;
  replacements = new Map<
    string,
    {
      pidPath: PidPath;
      pathReplacement: PathReplacement;
    }
  >();

  constructor(paths: PidPath[], labels: PidTspan[], viewBox: Rect) {
    this.pidPaths = paths;
    this.pidLabels = labels;
    this.viewBox = viewBox;
    this.kdTree = pidPathsToKdTree(this.pidPaths);
  }

  getPidPathById(pathId: string): PidPath | null {
    // Change to hashmap if any performance issues
    for (let i = this.pidPaths.length - 1; i >= 0; --i) {
      if (this.pidPaths[i].pathId === pathId) {
        return this.pidPaths[i];
      }
    }
    return null;
  }

  getPidTspanById(id: string): PidTspan | null {
    // Change to hashmap if any performance issues
    for (let i = this.pidLabels.length - 1; i >= 0; --i) {
      if (this.pidLabels[i].id === id) {
        return this.pidLabels[i];
      }
    }
    return null;
  }

  applyPathReplacement(pathReplacements: PathReplacement[]) {
    pathReplacements.forEach((pathReplacement) => {
      const oldPidPath = this.getPidPathById(pathReplacement.pathId);
      if (!oldPidPath) {
        throw new Error(
          `Tried to get pidPath with ID ${pathReplacement.pathId} which does not exist in pidDocument`
        );
      }
      this.replacements.set(pathReplacement.pathId, {
        pidPath: oldPidPath,
        pathReplacement,
      });

      const newPidPaths = pathReplacement.replacementPaths.map(
        (svgPathWithId) => {
          const pathSegments = svgCommandsToPathSegments(
            svgPathWithId.svgCommands
          );
          return new PidPath(pathSegments, svgPathWithId.id, oldPidPath?.style);
        }
      );
      this.pidPaths = this.pidPaths.filter(
        (pidPath) => pidPath.pathId !== oldPidPath.pathId
      );
      this.pidPaths.push(...newPidPaths);
    });
    this.kdTree = pidPathsToKdTree(this.pidPaths);
  }

  removePathReplacement(pathReplacement: PathReplacement) {
    const replacementPidPathIds = pathReplacement.replacementPaths.reduce(
      (aggregate, svgPathWithId) => {
        const replacementPidPath = this.getPidPathById(svgPathWithId.id);
        // Only remove pidPaths currently in pidDocument
        if (replacementPidPath !== null) {
          aggregate.push(replacementPidPath.pathId);
        }
        return aggregate;
      },
      <string[]>[]
    );

    // Remove the replacements pidPaths
    this.pidPaths = this.pidPaths.filter(
      (pidPath) => !replacementPidPathIds.includes(pidPath.pathId)
    );

    const replacement = this.replacements.get(pathReplacement.pathId);
    if (!replacement) {
      throw new Error(
        `Tried to get re-introduce previously replaced ${pathReplacement.pathId} which does not exist in pidDocument`
      );
    }
    // Only reintroduce pidPath if it is not already in pidPaths
    if (!this.getPidPathById(pathReplacement.pathId)) {
      this.pidPaths.push(replacement.pidPath);
    }

    // Remove other replacement pathIds relying on this
    this.pruneReplacementDescendants(
      pathReplacement.pathId,
      replacementPidPathIds
    );
    // Remove from replaced paths
    this.replacements.delete(pathReplacement.pathId);

    // Update k-d-tree
    this.kdTree = pidPathsToKdTree(this.pidPaths);
  }

  toSvgString(
    symbolInstances: DiagramSymbolInstance[] | undefined = undefined,
    lines: DiagramLineInstance[] | undefined = undefined
  ): string {
    const svgString: string[] = [];
    svgString.push(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`);

    svgString.push(`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="${this.viewBox.x.toFixed(2)} ${this.viewBox.y.toFixed(
      2
    )} ${this.viewBox.height.toFixed(2)} ${this.viewBox.width.toFixed(2)}">
`);

    this.pidPaths.forEach((pidPath) => {
      svgString.push(`  <path d="${pidPath.serializeToPathCommands(2)}"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="${pidPath.pathId}" />`);
    });

    // Optionally render bounding boxes on symbol instances
    if (symbolInstances !== undefined) {
      symbolInstances.forEach((symbolInstance) => {
        const bBox = this.getBoundingBoxToPaths(symbolInstance.pathIds);
        const width = Math.max(bBox.width, 2);
        const height = Math.max(bBox.height, 2);
        svgString.push(
          `  <rect x="${bBox.x}" y="${bBox.y}" width="${width}" height="${height}" style="fill:red;opacity:0.5" class="${symbolInstance.symbolId}"/>`
        );
      });
    }

    // Optionally render bounding boxes on lines
    if (lines !== undefined) {
      lines.forEach((line) => {
        const bBox = this.getBoundingBoxToPaths(line.pathIds);
        const width = Math.max(bBox.width, 2);
        const height = Math.max(bBox.height, 2);
        svgString.push(
          `  <rect x="${bBox.x}" y="${bBox.y}" width="${width}" height="${height}" style="fill:blue;opacity:0.5" class="${line.pathIds[0]}"/>`
        );
      });
    }

    svgString.push('</svg>');
    return svgString.join('\n');
  }

  static fromNormalizedSvgString(svgString: string) {
    const doc = parse(svgString);
    const pidPaths: PidPath[] = [];
    (doc.children[0] as ElementNode).children.forEach((element) => {
      const elementNode = element as ElementNode;
      if (elementNode.tagName === 'path') {
        const { properties } = elementNode;
        if (!properties) return;

        const { id } = properties;
        if (!id || typeof id === 'number') return;

        const segmentList = properties.d as string;

        const { style } = properties;
        if (style === undefined) {
          pidPaths.push(
            new PidPath(svgCommandsToPathSegments(segmentList), id, undefined)
          );
        } else {
          if (typeof style === 'number') return;

          const styleRecord = parseStyleString(style);
          pidPaths.push(
            new PidPath(svgCommandsToPathSegments(segmentList), id, styleRecord)
          );
        }
      }
    });

    const viewBox: Rect = { x: 0, y: 0, width: 10, height: 10 }; // Fix: Retrieve from svgString
    return new PidDocument(pidPaths, [], viewBox);
  }

  findAllInstancesOfSymbol(symbol: DiagramSymbol): DiagramSymbolInstance[] {
    return findAllInstancesOfSymbol(this, symbol);
  }

  getFileConnectionsWithPosition(
    fileConnections: PidFileConnectionInstance[]
  ): PidFileConnectionInstance[] {
    return getFileConnectionsWithPosition(this, fileConnections);
  }

  findLinesAndConnection(
    diagramType: DiagramType,
    symbolInstances: DiagramSymbolInstance[],
    lineInstances: DiagramLineInstance[],
    connections: DiagramConnection[]
  ) {
    return findLinesAndConnections(
      this,
      diagramType,
      symbolInstances,
      lineInstances,
      connections
    );
  }

  connectLabelsToInstances(
    diagramType: DiagramType,
    instances: DiagramInstanceWithPaths[],
    excludedLabelConnections: [DiagramInstanceWithPaths, string][]
  ): LabelInstanceConnection[] {
    if (instances.length === 0) return [];

    const labelInstanceConnections: LabelInstanceConnection[] = [];

    const pidLabelIdsAlreadyConnected = new Set<string>(
      instances.flatMap((instance) => instance.labelIds)
    );

    const pidLabelsToConnect = this.pidLabels.filter(
      (pidLabel) => !pidLabelIdsAlreadyConnected.has(pidLabel.id)
    );

    const isNotExcludedInstanceLabelConnection = (
      diagramInstance: DiagramInstanceWithPaths,
      pidLabel: PidTspan
    ) =>
      !excludedLabelConnections.some(
        ([instance, labelId]) =>
          pidLabel.id === labelId && instance.id === diagramInstance.id
      );

    const labelThreshold =
      this.viewBox.width *
      (diagramType === DiagramType.ISO
        ? AUTO_ANALYSIS_LABEL_THRESHOLD_ISO
        : AUTO_ANALYSIS_LABEL_THRESHOLD_PID);

    const connectIfEnclosing = (
      instance: DiagramInstanceWithPaths,
      pidLabels: PidTspan[]
    ): PidTspan[] => {
      const instanceBoundingBox = BoundingBox.fromRect(
        this.getBoundingBoxToPaths(instance.pathIds)
      );
      return pidLabels.filter((pidLabel) =>
        instanceBoundingBox.encloses(pidLabel.getMidPoint())
      );
    };

    const connectIfWithinDistance = (
      instance: DiagramInstanceWithPaths,
      pidLabels: PidTspan[],
      distanceThreshold: number
    ): PidTspan[] => {
      const instanceBoundingBox = BoundingBox.fromRect(
        this.getBoundingBoxToPaths(instance.pathIds)
      );
      return pidLabels.filter((pidLabel) => {
        const distance = pidLabel
          .getMidPoint()
          .distance(instanceBoundingBox.midPoint());
        return distance < distanceThreshold;
      });
    };

    instances.forEach((instance) => {
      switch (instance.type) {
        case 'Instrument':
        case 'Shared Instrument':
        case 'File Connection':
          connectIfEnclosing(instance, pidLabelsToConnect)
            .filter((pidLabel) =>
              isNotExcludedInstanceLabelConnection(instance, pidLabel)
            )
            .forEach((pidLabel) => {
              labelInstanceConnections.push({
                labelId: pidLabel.id,
                labelText: pidLabel.text,
                instanceId: instance.id,
              });
            });
          break;
        case 'Line Connection':
          connectIfWithinDistance(instance, pidLabelsToConnect, labelThreshold)
            .filter((pidLabel) =>
              isNotExcludedInstanceLabelConnection(instance, pidLabel)
            )
            .forEach((pidLabel) => {
              labelInstanceConnections.push({
                labelId: pidLabel.id,
                labelText: pidLabel.text,
                instanceId: instance.id,
              });
            });
          break;
        default:
          break;
      }
    });

    return labelInstanceConnections;
  }

  parseLineConnectionTags() {
    return parseLineConnectionTags(this);
  }

  parseLineNumbersWithUnit() {
    return parseLineNumbersWithUnit(this);
  }

  static inferLineNumbers(
    symbolInstances: DiagramSymbolInstance[],
    lines: DiagramLineInstance[],
    connections: DiagramConnection[]
  ) {
    const instances = [...symbolInstances, ...lines];

    // Reset infered line numbers
    instances.forEach((instance) => {
      // eslint-disable-next-line no-param-reassign
      instance.inferedLineNumbers = [];
    });

    // Infer line numbers
    instances
      .filter((instance) => instance.lineNumbers.length > 0)
      .forEach((startInstance) => {
        const relevantLineNumber = startInstance.lineNumbers[0];
        traverse({
          startInstance,
          graph: {
            diagramConnections: connections,
            diagramLineInstances: lines,
            diagramSymbolInstances: symbolInstances,
          },
          processInstance: (instance) => {
            if (!instance.inferedLineNumbers.includes(relevantLineNumber)) {
              instance.inferedLineNumbers.push(relevantLineNumber);
            }
          },
          addNeighbour: (instance, potNeibour) => {
            if (instance.type === 'Equipment') return false;
            if (instance.lineNumbers.length > 1) return false;

            if (
              instance.lineNumbers.includes(relevantLineNumber) &&
              potNeibour.lineNumbers.length > 0
            ) {
              return potNeibour.type !== 'Line';
            }

            return (
              instance.lineNumbers.length === 0 ||
              instance.lineNumbers.includes(relevantLineNumber)
            );
          },
        });
      });

    return { newSymbolInstances: symbolInstances, newLines: lines };
  }

  getPidGroup(pathIds: string[]): PidGroup {
    const pidPaths: PidPath[] = [];
    pathIds.forEach((pathId) => {
      const pidPath = this.getPidPathById(pathId);
      if (!pidPath) {
        throw new Error(
          `Trying to get path with id ${pidPath} that does not exist in pidDocument`
        );
      }
      pidPaths.push(pidPath);
    });

    return new PidGroup(pidPaths);
  }

  getBoundingBoxToPaths(pathIds: string[]): Rect {
    const pidPaths = pathIds.map((pathId: string) => {
      const pidPath = this.getPidPathById(pathId)!;
      if (!pidPath) {
        throw new Error(
          `Did not find pid path with ID ${pathId} in pidDocument`
        );
      }
      return pidPath;
    });
    return calculatePidPathsBoundingBox(pidPaths);
  }

  getMidPointToPaths(pathIds: string[]): Point {
    const bBox = this.getBoundingBoxToPaths(pathIds);
    return new Point(bBox.x + bBox.width / 2, bBox.y + bBox.height / 2);
  }

  getPathSegmentsToPaths(pathIds: string[]): PathSegment[] {
    const allPathSegments: PathSegment[] = [];
    pathIds.forEach((pathId) => {
      const pathSegments = this.getPidPathById(pathId)
        ?.segmentList as PathSegment[];
      allPathSegments.push(...pathSegments);
    });
    return allPathSegments;
  }

  createSvgRepresentation(
    pathIds: string[],
    normalized: boolean,
    toFixed: number | null = null
  ): SvgRepresentation {
    const pidPaths = pathIds.map((pathId) => this.getPidPathById(pathId)!);
    return createSvgRepresentation(pidPaths, normalized, toFixed);
  }

  protected pruneReplacementDescendants(
    pathId: string,
    descendantPathIds: string[]
  ): void {
    let passedCurrent = false;
    this.replacements.forEach((replacement, currentPathId) => {
      // The pathReplacements should be cronological, hence we only need
      // to check for path replacements after the replacement we are removing
      if (passedCurrent && descendantPathIds.includes(pathId)) {
        this.removePathReplacement(replacement.pathReplacement);
      } else if (currentPathId === pathId) {
        passedCurrent = true;
      }
    });
  }

  getPathsEnclosedByBoundingBox(boundingBox: BoundingBox): PidPath[] {
    return this.pidPaths.filter((path) =>
      boundingBox.enclosesBoundingBox(path.getBoundingBox(), false)
    );
  }
}

export class PidDocumentWithDom extends PidDocument {
  svg: SVGSVGElement;

  constructor(
    svg: SVGSVGElement,
    paths: PidPath[],
    labels: PidTspan[],
    viewBox: Rect
  ) {
    super(paths, labels, viewBox);
    this.svg = svg;
  }

  static fromSVG(svg: SVGSVGElement, svgElements: SVGElement[]) {
    const sceenCTMToSVGMatrix = getSceenCTMToSvgMatrix(svg);

    const paths = svgElements
      .filter((svgElement) => svgElement instanceof SVGPathElement)
      .map((svgElement) => {
        return PidPath.fromSVGElement(
          svgElement as SVGPathElement,
          sceenCTMToSVGMatrix
        );
      });

    const labels = svgElements
      .filter((svgElement) => svgElement instanceof SVGTSpanElement)
      .map((svgElement) => {
        return PidTspan.fromSVGTSpan(
          svgElement as SVGTSpanElement,
          sceenCTMToSVGMatrix
        );
      });

    const viewBox = {
      x: svg.viewBox.baseVal.x,
      y: svg.viewBox.baseVal.y,
      width: svg.viewBox.baseVal.width,
      height: svg.viewBox.baseVal.height,
    };

    return new PidDocumentWithDom(svg, paths, labels, viewBox);
  }
}
