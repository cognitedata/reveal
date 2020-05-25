/*!
 * Copyright 2020 Cognite AS
 */

import { RenderMode } from './RenderMode';
export function instanceOfRenderModeable(obj: any): obj is RenderModeable {
  return 'renderMode' in obj;
}
export interface RenderModeable {
  renderMode: RenderMode;
}
