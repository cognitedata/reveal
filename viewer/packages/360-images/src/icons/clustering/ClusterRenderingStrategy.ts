/*!
 * Copyright 2026 Cognite AS
 */

import type { Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import type { Overlay3DIcon } from '@reveal/3d-overlays';

export type ClusteredIconData = {
  icon: Overlay3DIcon;
  isCluster: boolean;
  clusterSize: number;
  clusterPosition: Vector3;
  sizeScale: number;
  clusterIcons?: Overlay3DIcon[];
};

export type ClusterRenderParams = {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  modelTransform: Matrix4;
};

export type ClusterScreenInfo = {
  data: ClusteredIconData;
  screenPos: Vector3;
  worldPos: Vector3;
  distance: number;
  projectedSize: number;
};
