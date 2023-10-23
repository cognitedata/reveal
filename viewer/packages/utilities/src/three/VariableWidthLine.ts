/*!
 * Copyright 2023 Cognite AS
 */

import { Color, Object3D, Vector3 } from 'three';
import { LineMaterial } from './lines/LineMaterial';
import { LineGeometry } from './lines/LineGeometry';
import { Line2 } from './lines/Line2';

export class VariableWidthLine {
  private readonly _geometry: LineGeometry;
  private readonly _lineMaterial: LineMaterial;
  private readonly _mesh: Line2;

  constructor(lineWidth: number, lineColor: Color, points: Vector3[]) {
    this._geometry = new LineGeometry();
    this._lineMaterial = new LineMaterial({
      color: lineColor.getHex(),
      linewidth: lineWidth,
      worldUnits: true,
      depthTest: false,
      transparent: true
    });

    this._geometry.setPositions(points.map(p => p.toArray()).flat());
    this._mesh = new Line2(this._geometry, this._lineMaterial);
    this._mesh.renderOrder = 100;
  }

  get mesh(): Object3D {
    return this._mesh;
  }

  setLineColor(color: Color): void {
    this._lineMaterial.color = color;
    this._lineMaterial.needsUpdate = true;
  }

  setVisibility(visibility: boolean): void {
    this._lineMaterial.visible = visibility;
    this._lineMaterial.needsUpdate = true;
  }

  dispose(): void {
    this._geometry.dispose();
    this._lineMaterial.dispose();
  }
}
