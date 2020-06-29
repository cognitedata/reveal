const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const int RenderTypeDepth = 5;
const int RenderTypeEffects = 6;


bool determineVisibility(sampler2D visibilityTexture, vec2 textureSize, float treeIndex, int renderMode) {
    float dataTextureWidth = textureSize.x;
    float dataTextureHeight = textureSize.y;

    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 visible = texture2D(visibilityTexture, treeIndexUv);

    //if(renderMode == 6){
      //return visible.r > 0.0 && (visible.g > 0.0 || renderMode != 6);
    //}

    return visible.r > 0.0 && (visible.g > 0.0 || renderMode != 6);
}

#pragma glslify: export(determineVisibility)
