// TODO specify width and height using uniforms
const float dataTextureWidth = 2048.0;
const float dataTextureHeight = 2048.0;

vec3 determineColor(vec3 originalColor, sampler2D colorDataTexture, float treeIndex) {
    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 overrideColor = texture2D(colorDataTexture, treeIndexUv);

    return overrideColor.a * overrideColor.rgb + (1.0 - overrideColor.a) * originalColor;
}

#pragma glslify: export(determineColor)
