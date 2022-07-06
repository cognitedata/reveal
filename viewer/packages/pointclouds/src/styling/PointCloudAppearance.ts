/*!
 * Copyright 2022 Cognite AS
 */

export type PointCloudObjectAppearance = {
  color?: [number, number, number];
  visible?: boolean;
};

export type CompletePointCloudObjectAppearance = Required<PointCloudObjectAppearance>;

export const DefaultPointCloudAppearance: CompletePointCloudObjectAppearance = {
  color: [0, 0, 0],
  visible: true
};

export function applyDefaultsToPointCloudAppearance(
  appearance: PointCloudObjectAppearance
): CompletePointCloudObjectAppearance {
  return { ...DefaultPointCloudAppearance, ...appearance };
}
