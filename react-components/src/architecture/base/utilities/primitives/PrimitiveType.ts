export enum PrimitiveType {
  None,
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

export const PlanePrimitiveTypes = [
  PrimitiveType.PlaneX,
  PrimitiveType.PlaneY,
  PrimitiveType.PlaneZ,
  PrimitiveType.PlaneXY
];
