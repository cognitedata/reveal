/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Represents a budget of how many point from point clouds can be
 * loaded at the same time.
 */

export type PointCloudBudget = {
  /**
   * Total number of points that can be loaded for all point clouds models
   * accumulated.
   */
  readonly numberOfPoints: number;
};
