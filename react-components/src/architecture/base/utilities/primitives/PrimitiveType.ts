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
  Diameter,
  PlaneX,
  PlaneY,
  PlaneZ,
  PlaneXY
}

export const AlongAxisPlanePrimitiveTypes: PrimitiveType[] = [
  PrimitiveType.PlaneX,
  PrimitiveType.PlaneY,
  PrimitiveType.PlaneZ
];

export const PlanePrimitiveTypes: PrimitiveType[] = [...AlongAxisPlanePrimitiveTypes, PrimitiveType.PlaneXY];

export function verifyPrimitiveType(
  legalTypes: PrimitiveType[],
  primitiveType: PrimitiveType
): void {
  if (!legalTypes.includes(primitiveType)) {
    throw new Error(`Invalid primitive type: ${primitiveType}`);
  }
}
