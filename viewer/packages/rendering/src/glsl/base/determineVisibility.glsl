precision highp float;

#define texture2D texture

#pragma glslify: NodeAppearance = require('./nodeAppearance.glsl')

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const int RenderTypeDepth = 5;
const int RenderTypeEffects = 6;
const int RenderTypeGhost = 7;

bool determineVisibility(NodeAppearance nodeAppearance, int renderMode) {
    return 
         // In ghost mode
         ((renderMode == RenderTypeGhost) && nodeAppearance.isVisible && nodeAppearance.renderGhosted) ||
         // Not ghost mode
         ((renderMode != RenderTypeGhost) && 
         !nodeAppearance.renderGhosted && nodeAppearance.isVisible && (nodeAppearance.renderInFront || renderMode != RenderTypeEffects));
}

#pragma glslify: export(determineVisibility)
