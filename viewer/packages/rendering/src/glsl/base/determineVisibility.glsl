bool determineVisibility(NodeAppearance nodeAppearance, int renderMode) {
  bool visible = nodeAppearance.isVisible;
  bool ghost = (renderMode == RenderTypeGhost) && nodeAppearance.renderGhosted;
  bool inFront = (renderMode == RenderTypeEffects) && nodeAppearance.renderInFront;
  bool base = (renderMode != RenderTypeGhost) && (renderMode != RenderTypeEffects) && (!nodeAppearance.renderGhosted && !nodeAppearance.renderInFront);

  return visible && (ghost || inFront || base);
}
