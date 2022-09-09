#pragma glslify: import('../math/floatBitsSubset.glsl')

NodeAppearance determineNodeAppearance(sampler2D nodeAppearanceTexture, vec2 textureSize, highp float treeIndex) {

  float dataTextureWidth = textureSize.x;
  float dataTextureHeight = textureSize.y;

  int xTreeIndexTextureCoord = int(mod(treeIndex, dataTextureWidth));
  int yTreeIndexTextureCoord = int(floor(treeIndex / dataTextureWidth));

  vec4 texel = texelFetch(nodeAppearanceTexture, ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord), 0);
  float alphaUnwrapped = floor((texel.a * 255.0) + 0.5);

  bool isVisible = floatBitsSubset(alphaUnwrapped, 0, 1) == 1.0;
  bool renderInFront = floatBitsSubset(alphaUnwrapped, 1, 2) == 1.0;
  bool renderGhosted = floatBitsSubset(alphaUnwrapped, 2, 3) == 1.0;

  return NodeAppearance(texel, isVisible, renderInFront, renderGhosted);
}
