/*!
 * Copyright 2026 Cognite AS
 */

import { RenderMode } from '../../rendering/RenderMode';

/** GLSL/TSL render mode constants – must stay in sync with glsl/base/renderModes.glsl */
export const RenderTypeColor = RenderMode.Color;
export const RenderTypeNormal = RenderMode.Normal;
export const RenderTypeTreeIndex = RenderMode.TreeIndex;
export const RenderTypePackColorAndNormal = RenderMode.PackColorAndNormal;
export const RenderTypeDepth = RenderMode.Depth;
export const RenderTypeEffects = RenderMode.Effects;
export const RenderTypeGhost = RenderMode.Ghost;
export const RenderTypeLOD = RenderMode.LOD;
export const RenderTypeDepthBufferOnly = RenderMode.DepthBufferOnly;
export const RenderTypeGeometryType = RenderMode.GeometryType;
