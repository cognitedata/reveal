import { ElementNode, parse } from 'svg-parser';

import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  BoundingBox,
  SvgRepresentation,
  DiagramSymbolInstance,
  DocumentType,
  DiagramInstanceId,
} from '../types';
import { findLinesAndConnections } from '../findLinesAndConnections';
import { svgCommandsToSegments } from '../matcher/svgPathParser';
import { findAllInstancesOfSymbol } from '../matcher';
import { PathSegment, Point } from '../geometry';
import { AUTO_ANALYSIS_LABEL_THRESHOLD } from '../constants';

import { calculatePidPathsBoundingBox, createSvgRepresentation } from './utils';
import { PidTspan } from './PidTspan';
import { PidPath } from './PidPath';
import { PidGroup } from './PidGroup';

export type LabelSymbolInstanceConnection = {
  labelId: string;
  instanceId: DiagramInstanceId;
};

export class PidDocument {
  pidPaths: PidPath[];
  pidLabels: PidTspan[];
  constructor(paths: PidPath[], labels: PidTspan[]) {
    this.pidPaths = paths;
    this.pidLabels = labels;
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
    return new PidDocument(pidPaths, []);
  }

  findAllInstancesOfSymbol(symbol: DiagramSymbol): DiagramSymbolInstance[] {
    return findAllInstancesOfSymbol(this.pidPaths, symbol);
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

  connectLabelsToSymbolInstances(
    symbolInstances: DiagramSymbolInstance[]
  ): LabelSymbolInstanceConnection[] {
    const pidLabelIdsAlreadyConnected = new Set<string>();
    symbolInstances.forEach((symbolInstance) => {
      symbolInstance.labelIds.forEach((labelId) => {
        pidLabelIdsAlreadyConnected.add(labelId);
      });
    });

    const pidLabelsToConnect = this.pidLabels.filter((pidLabel) => {
      return !pidLabelIdsAlreadyConnected.has(pidLabel.id);
    });

    const labelSymbolInstanceConnections: LabelSymbolInstanceConnection[] = [];

    const symbolGroups = symbolInstances.map((symbolInstance) =>
      PidGroup.fromDiagramInstance(this, symbolInstance)
    );

    pidLabelsToConnect.forEach((pidLabel) => {
      const labelMidPoint = pidLabel.getMidPoint();

      symbolGroups.sort((a, b) => {
        return a.distance(labelMidPoint) - b.distance(labelMidPoint);
      });

      const closestSymbolGroup = symbolGroups[0];
      if (
        closestSymbolGroup.distance(labelMidPoint) <
        AUTO_ANALYSIS_LABEL_THRESHOLD
      ) {
        labelSymbolInstanceConnections.push({
          labelId: pidLabel.id,
          instanceId: closestSymbolGroup.diagramInstanceId,
        });
      }
    });

    return labelSymbolInstanceConnections;
  }

  getBoundingBoxToPaths(pathIds: string[]): BoundingBox {
    const pidPaths = pathIds.map(
      (pathId: string) => this.getPidPathById(pathId)!
    );
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
}

export class PidDocumentWithDom extends PidDocument {
  svg: SVGSVGElement;

  constructor(svg: SVGSVGElement, paths: PidPath[], labels: PidTspan[]) {
    super(paths, labels);
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
    return new PidDocumentWithDom(svg, paths, labels);
  }
}
