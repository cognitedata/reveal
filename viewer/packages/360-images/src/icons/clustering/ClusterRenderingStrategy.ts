/*!
 * Copyright 2026 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';

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
  hoveredClusterIcon: Overlay3DIcon | undefined;
};
