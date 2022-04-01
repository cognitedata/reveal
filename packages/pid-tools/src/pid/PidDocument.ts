import { ElementNode, parse } from 'svg-parser';
import sortBy from 'lodash/sortBy';

import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  Rect,
  SvgRepresentation,
  DiagramSymbolInstance,
  DocumentType,
  PidFileConnectionInstance,
  DiagramInstanceId,
  PathReplacement,
  DiagramInstanceWithPaths,
} from '../types';
import { findLinesAndConnections } from '../findLinesAndConnections';
import { svgCommandsToSegments } from '../matcher/svgPathParser';
import { findAllInstancesOfSymbol } from '../matcher';
import { PathSegment, Point } from '../geometry';
import {
  AUTO_ANALYSIS_LABEL_THRESHOLD_ISO,
  AUTO_ANALYSIS_LABEL_THRESHOLD_PID,
} from '../constants';
import { traverse } from '../graph/traversal';

import { calculatePidPathsBoundingBox, createSvgRepresentation } from './utils';
import { PidTspan } from './PidTspan';
import { PidPath } from './PidPath';
import { PidGroup, PidInstance } from './PidGroup';
import { getFileConnectionsWithPosition } from './fileConnectionUtils';

export type LabelInstanceConnection = {
  labelId: string;
  labelText: string;
  instanceId: DiagramInstanceId;
};

export class PidDocument {
  pidPaths: PidPath[];
  pidLabels: PidTspan[];
  viewBox: Rect;
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

  applyPathReplacement(pathReplacement: PathReplacement) {
    const oldPidPath = this.getPidPathById(pathReplacement.pathId);
    if (!oldPidPath) {
      throw new Error(
        `Tried to get pidPath with ID ${pathReplacement.pathId} which does not exist in pidDocument`
      );
    }
    const newPidPaths = pathReplacement.replacementPaths.map(
      (svgPathWithId) => {
        const pathSegments = svgCommandsToSegments(svgPathWithId.svgCommands);
        return new PidPath(pathSegments, svgPathWithId.id, oldPidPath?.style);
      }
    );
    this.pidPaths = this.pidPaths.filter(
      (pidPath) => pidPath.pathId !== oldPidPath.pathId
    );
    this.replacements.set(pathReplacement.pathId, {
      pidPath: oldPidPath,
      pathReplacement,
    });
    this.pidPaths.push(...newPidPaths);
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
  }

  toSvgString(
    symbolInstances: DiagramSymbolInstance[] | undefined = undefined,
    lines: DiagramLineInstance[] | undefined = undefined
  ): string {
    const svgString: string[] = [];
    svgString.push(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`);

    const bBox = calculatePidPathsBoundingBox(this.pidPaths);
    svgString.push(`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="${bBox.x.toFixed(2)} ${bBox.y.toFixed(2)} ${bBox.height.toFixed(
      2
    )} ${bBox.width.toFixed(2)}">
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
        const segmentList = elementNode.properties?.d as string;
        pidPaths.push(
          new PidPath(
            svgCommandsToSegments(segmentList),
            elementNode.properties?.id as string
          )
        );
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
    documentType: DocumentType,
    symbolInstances: DiagramSymbolInstance[],
    lineInstances: DiagramLineInstance[],
    connections: DiagramConnection[]
  ) {
    return findLinesAndConnections(
      this,
      documentType,
      symbolInstances,
      lineInstances,
      connections
    );
  }

  connectLabelsToInstances(
    documentType: DocumentType,
    instances: DiagramInstanceWithPaths[],
    excludedLabelConnections: [DiagramInstanceWithPaths, string][]
  ): LabelInstanceConnection[] {
    const pidLabelIdsAlreadyConnected = new Set<string>();
    if (instances.length === 0) return [];

    instances.forEach((instance) => {
      instance.labelIds.forEach((labelId) => {
        pidLabelIdsAlreadyConnected.add(labelId);
      });
    });

    const pidLabelsToConnect = this.pidLabels.filter((pidLabel) => {
      return !pidLabelIdsAlreadyConnected.has(pidLabel.id);
    });

    const labelInstanceConnections: LabelInstanceConnection[] = [];

    const instanceGroups = instances.map((instance) =>
      PidInstance.fromDiagramInstance(this, instance)
    );

    const labelThreshold =
      documentType === DocumentType.isometric
        ? AUTO_ANALYSIS_LABEL_THRESHOLD_ISO
        : AUTO_ANALYSIS_LABEL_THRESHOLD_PID;

    pidLabelsToConnect.forEach((pidLabel) => {
      const labelMidPoint = pidLabel.getMidPoint();

      const isNotExcludedInstanceLabelConnection = ({
        instanceGroup,
      }: {
        instanceGroup: PidInstance;
      }) =>
        !excludedLabelConnections.some(
          ([instance, labelId]) =>
            pidLabel.id === labelId && instance.id === instanceGroup.id
        );

      const filteredInstanceGroups = instanceGroups
        .map((instanceGroup) => ({
          instanceGroup,
          distance: instanceGroup.distance(labelMidPoint),
        }))
        .filter(({ distance }) => distance < labelThreshold)
        .filter(isNotExcludedInstanceLabelConnection);

      if (filteredInstanceGroups.length < 1) {
        return;
      }

      const sortedInstanceGroups = sortBy(
        filteredInstanceGroups,
        (instanceGroupWithDistance) => instanceGroupWithDistance.distance
      );

      const closestInstanceGroup = sortedInstanceGroups[0].instanceGroup;
      labelInstanceConnections.push({
        labelId: pidLabel.id,
        labelText: pidLabel.text,
        instanceId: closestInstanceGroup.id,
      });
    });

    return labelInstanceConnections;
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
    const paths = svgElements
      .filter((svgElement) => svgElement instanceof SVGPathElement)
      .map((svgElement) => {
        return PidPath.fromSVGElement(svgElement as SVGPathElement, svg);
      });
    const labels = svgElements
      .filter((svgElement) => svgElement instanceof SVGTSpanElement)
      .map((svgElement) => {
        return PidTspan.fromSVGTSpan(svgElement as SVGTSpanElement, svg);
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
