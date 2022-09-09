#pragma glslify: import('../math/floatBitsSubset.glsl')

NodeAppearance determineNodeAppearance(sampler2D nodeAppearanceTexture, vec2 textureSize, highp float treeIndex) {

  float dataTextureWidth = textureSize.x;
  float dataTextureHeight = textureSize.y;

  // float32 can represent int 0...16777216 exactly.
  // Don't get tempted to do int(floor(treeIndex + 0.5)) - this will decrease precision
  // because precision starts being low around 2-4 million.
  int iTreeIndex = int(treeIndex); 
  int iWidth = int(dataTextureWidth);
  int yTreeIndexTextureCoord = iTreeIndex / iWidth;
  int xTreeIndexTextureCoord = iTreeIndex - iWidth * yTreeIndexTextureCoord;

  vec4 texel = texelFetch(nodeAppearanceTexture, ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord), 0);
  float alphaUnwrapped = floor((texel.a * 255.0) + 0.5);

  bool isVisible = floatBitsSubset(alphaUnwrapped, 0, 1) == 1.0;
  bool renderInFront = floatBitsSubset(alphaUnwrapped, 1, 2) == 1.0;
  bool renderGhosted = floatBitsSubset(alphaUnwrapped, 2, 3) == 1.0;

  return NodeAppearance(texel, isVisible, renderInFront, renderGhosted);
}
