export enum PrimitiveType {
  None,
  Point,
  Line,
  Polyline,
  Polygon,
  HorizontalArea,
  VerticalArea,
  Box,
  Cylinder,
  HorizontalCircle,
  HorizontalCylinder,
  VerticalCylinder,
  PlaneX,
  PlaneY,
  PlaneZ,
  PlaneXY
}

export const AlongAxisPlanePrimitiveTypes = [
  PrimitiveType.PlaneX,
  PrimitiveType.PlaneY,
  PrimitiveType.PlaneZ
];

export const PlanePrimitiveTypes = [...AlongAxisPlanePrimitiveTypes, PrimitiveType.PlaneXY];
