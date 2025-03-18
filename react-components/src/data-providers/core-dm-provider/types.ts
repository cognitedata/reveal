/*!
 * Copyright 2024 Cognite AS
 */
import { NodeItem } from "../FdmSDK";

export type AllMappedInfiniteQueryType = {
  items: NodeItem[];
  nextCursor?: AllMappedInfiniteQueryCursorType | undefined;
};

export type AllMappedInfiniteQueryCursorType = {
  cad_nodes?: string | undefined;
  cad_object_3d?: string | undefined;
  cad_assets?: string | undefined;
  pointcloud_assets?: string | undefined;
  image360_assets?: string | undefined;
};