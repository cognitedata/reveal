/*!
 * Copyright 2022 Cognite AS
 */

export type PointCloudAppearance = {
  color?: [number, number, number];
  visible?: boolean;
};

export type CompletePointCloudAppearance = Required<PointCloudAppearance>;

export const DefaultPointCloudAppearance: CompletePointCloudAppearance = {
  color: [0, 0, 0],
  visible: true
};

export function applyDefaultsToPointCloudAppearance(appearance: PointCloudAppearance): CompletePointCloudAppearance {
  return { ...DefaultPointCloudAppearance, ...appearance };
}
