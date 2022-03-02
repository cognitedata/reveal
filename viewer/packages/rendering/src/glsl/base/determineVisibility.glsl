bool determineVisibility(NodeAppearance nodeAppearance, int renderMode) {
    return 
         // In ghost mode
         ((renderMode == RenderTypeGhost) && nodeAppearance.isVisible && nodeAppearance.renderGhosted) ||
         // Not ghost mode
         ((renderMode != RenderTypeGhost) && 
         !nodeAppearance.renderGhosted && nodeAppearance.isVisible && (nodeAppearance.renderInFront || renderMode != RenderTypeEffects));
}
