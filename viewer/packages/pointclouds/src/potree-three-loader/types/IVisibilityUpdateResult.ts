/*!
 * Copyright 2022 Cognite AS
 */
import { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';

export interface IVisibilityUpdateResult {
  visibleNodes: IPointCloudTreeNodeBase[];
  numVisiblePoints: number;
  /**
   * True when a node has been loaded but was not added to the scene yet.
   * Make sure to call updatePointClouds() again on the next frame.
   */
  exceededMaxLoadsToGPU: boolean;
  /**
   * True when at least one node in view has failed to load.
   */
  nodeLoadFailed: boolean;
  /**
   * Promises for loading nodes, will reject when loading fails.
   */
  nodeLoadPromises: Promise<void>[];
}
