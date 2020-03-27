vec3 determineColor(vec3 originalColor, sampler2D colorDataTexture, vec2 textureSize, float treeIndex) {
    float dataTextureWidth = textureSize.x;
    float dataTextureHeight = textureSize.y;

    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 overrideColor = texture2D(colorDataTexture, treeIndexUv);

    return overrideColor.a * overrideColor.rgb + (1.0 - overrideColor.a) * originalColor;
}

#pragma glslify: export(determineColor)
