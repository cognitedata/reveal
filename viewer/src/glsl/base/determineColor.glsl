vec4 determineColor(vec3 originalColor, sampler2D colorDataTexture, vec2 textureSize, float treeIndex) {

    treeIndex = floor(treeIndex + 0.5);

    float dataTextureWidth = textureSize.x;
    float dataTextureHeight = textureSize.y;

    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 overrideColor = texture2D(colorDataTexture, treeIndexUv);

    if (any(greaterThan(overrideColor.rgb, vec3(0.0)))) {
      return overrideColor;
    }

    return vec4(originalColor.rgb, overrideColor.a);
}

#pragma glslify: export(determineColor)
