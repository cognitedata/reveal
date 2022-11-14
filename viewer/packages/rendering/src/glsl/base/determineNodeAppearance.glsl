#pragma glslify: import('../math/floatBitsSubset.glsl')

NodeAppearance nodeAppearanceFromTexel(vec4 nodeAppearanceTexel) {
  float alphaUnwrapped = floor((nodeAppearanceTexel.a * 255.0) + 0.5);

  bool isVisible = floatBitsSubset(alphaUnwrapped, 0, 1) == 1.0;
  bool renderInFront = floatBitsSubset(alphaUnwrapped, 1, 2) == 1.0;
  bool renderGhosted = floatBitsSubset(alphaUnwrapped, 2, 3) == 1.0;

  return NodeAppearance(nodeAppearanceTexel, isVisible, renderInFront, renderGhosted);
}

NodeAppearance determineNodeAppearance(sampler2D nodeAppearanceTexture, vec2 textureSize, highp float treeIndex) {

  highp int dataTextureWidth = int(textureSize.x);
  highp int dataTextureHeight = int(textureSize.y);

  highp int iTreeIndex = int(treeIndex);
  highp int xTreeIndexTextureCoord = iTreeIndex % dataTextureWidth;
  highp int yTreeIndexTextureCoord = iTreeIndex / dataTextureWidth;

  vec4 texel = texelFetch(nodeAppearanceTexture, ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord), 0);
  return nodeAppearanceFromTexel(texel);
}
