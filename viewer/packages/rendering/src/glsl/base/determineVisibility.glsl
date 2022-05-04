bool determineVisibility(NodeAppearance nodeAppearance, int renderMode) {
  bool visible = nodeAppearance.isVisible;
  bool ghost = (renderMode == RenderTypeGhost) && nodeAppearance.renderGhosted;
  bool inFront = (renderMode == RenderTypeEffects) && nodeAppearance.renderInFront;
  bool back = (renderMode == RenderTypeColor) && !nodeAppearance.renderGhosted && !nodeAppearance.renderInFront;
  bool other = (renderMode != RenderTypeColor && renderMode != RenderTypeEffects && renderMode != RenderTypeGhost) && !nodeAppearance.renderGhosted;

  return visible && (ghost || inFront || back || other);
}
