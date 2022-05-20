/*!
 * Copyright 2022 Cognite AS
 */

export type PointCloudAppearance = {
  color: [number, number, number];
  visible: boolean;
}

export const DefaultPointCloudAppearance: PointCloudAppearance = {
  color: [0, 0, 0],
  visible: true
};
