/*!
 * Copyright 2022 Cognite AS
 */

import { Color } from 'three';

export type PointCloudAppearance = {
  color?: Color;
  visible?: boolean;
};

export type CompletePointCloudAppearance = Required<PointCloudAppearance>;

export const DefaultPointCloudAppearance: CompletePointCloudAppearance = {
  color: new Color(0, 0, 0),
  visible: true
};

export function applyDefaultsToPointCloudAppearance(appearance: PointCloudAppearance): CompletePointCloudAppearance {
  return { ...DefaultPointCloudAppearance, ...appearance };
}
