/*!
 * Copyright 2022 Cognite AS
 */

import { RenderPass } from './RenderPass';

export interface RenderPipelineProvider {
  pipeline(): Generator<RenderPass>;
}
