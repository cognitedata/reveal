import { ElementNode, parse } from 'svg-parser';

import {
  BoundingBox,
  DiagramSymbol,
  DiagramSymbolInstance,
  SvgPath,
  SvgRepresentation,
} from '../types';
import { svgCommandToSegments } from '../matcher/svgPathParser';
import { findAllInstancesOfSymbol } from '../matcher';
import { PathSegment, Point } from '../geometry';

import { calculatePidPathsBoundingBox } from './utils';
import { PidTspan } from './PidTspan';
import { PidPath } from './PidPath';

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

  toSvgString(): string {
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
            svgCommandToSegments(segmentList),
            elementNode.properties?.id as string
          )
        );
      }
    });
    return new PidDocument(pidPaths, []);
  }

  static fromSVGElements(svgElements: SVGElement[]) {
    const paths = svgElements
      .filter((svgElement) => svgElement instanceof SVGPathElement)
      .map((svgElement) => {
        return PidPath.fromSVGElement(svgElement as SVGPathElement);
      });
    const labels = svgElements
      .filter((svgElement) => svgElement instanceof SVGTSpanElement)
      .map((svgElement) => {
        return PidTspan.fromSVGTSpan(svgElement as SVGTSpanElement);
      });
    return new PidDocument(paths, labels);
  }

  findAllInstancesOfSymbol(symbol: DiagramSymbol): DiagramSymbolInstance[] {
    return findAllInstancesOfSymbol(this.pidPaths, symbol);
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

  createSvgRepresentation(pathIds: string[]): SvgRepresentation {
    const boundingBox = this.getBoundingBoxToPaths(pathIds);

    const pidPaths = pathIds.map((pathId) => this.getPidPathById(pathId)!);
    const svgPaths: SvgPath[] = pidPaths.map(
      (pidPath) =>
        ({
          svgCommands: pidPath.serializeToPathCommands(),
        } as SvgPath)
    );

    return {
      boundingBox,
      svgPaths,
    };
  }
}
