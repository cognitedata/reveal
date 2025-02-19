/*!
 * Copyright 2025 Cognite AS
 */
import { type NodeAppearance } from '@cognite/reveal';

export function createRuleStyling(appearance: NodeAppearance): NodeAppearance {
  return { renderGhosted: false, visible: true, ...appearance };
}
