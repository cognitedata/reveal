export interface CasingType {
  id: number;
  name: string;
  outerDiameter: string;
  startDepth: number;
  endDepth: number;
  depthUnit: string;
}

export type CasingViewType = {
  casings: CasingType[];
  name: string;
};
