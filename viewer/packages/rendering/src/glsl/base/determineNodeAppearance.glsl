precision highp float;
#pragma glslify: import('../math/floatBitsSubset.glsl')

NodeAppearance determineNodeAppearance(sampler2D nodeAppearanceTexture, vec2 textureSize, float treeIndex) {
  treeIndex = floor(treeIndex + 0.5);
  float dataTextureWidth = textureSize.x;
  float dataTextureHeight = textureSize.y;

  float u = mod(treeIndex, dataTextureWidth);
  float v = floor(treeIndex / dataTextureWidth);
  float uCoord = (u + 0.5) / dataTextureWidth;
  float vCoord = (v + 0.5) / dataTextureHeight;
  vec2 treeIndexUv = vec2(uCoord, vCoord);
  
  vec4 texel = texture(nodeAppearanceTexture, treeIndexUv);
  float alphaUnwrapped = floor((texel.a * 255.0) + 0.5);

  bool isVisible = floatBitsSubset(alphaUnwrapped, 0, 1) == 1.0;
  bool renderInFront = floatBitsSubset(alphaUnwrapped, 1, 2) == 1.0;
  bool renderGhosted = floatBitsSubset(alphaUnwrapped, 2, 3) == 1.0;

  return NodeAppearance(texel, isVisible, renderInFront, renderGhosted);
}
