bool determineVisibility(sampler2D visibilityTexture, vec2 textureSize, float treeIndex) {
    float dataTextureWidth = textureSize.x;
    float dataTextureHeight = textureSize.y;

    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 visible = texture2D(visibilityTexture, treeIndexUv);

    return visible.r > 0.0;
}

#pragma glslify: export(determineVisibility)
