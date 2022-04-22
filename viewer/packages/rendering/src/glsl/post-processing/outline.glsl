#pragma glslify: import('../math/floatBitsSubset.glsl')

int computeFloatEncodedOutlineIndex(float bitEncodedFloat){
  return int(floatBitsSubset(floor((bitEncodedFloat * 255.0) + 0.5), 5, 8));
}

ivec4 computeNeighborOutlineIndices(sampler2D tDiffuse, vec2 uv){
  const int texelWidth = 2;
  int outlineN = computeFloatEncodedOutlineIndex(textureOffset(tDiffuse, uv, ivec2(0, texelWidth)).a);
  int outlineS = computeFloatEncodedOutlineIndex(textureOffset(tDiffuse, uv, ivec2(texelWidth, 0)).a);
  int outlineE = computeFloatEncodedOutlineIndex(textureOffset(tDiffuse, uv, ivec2(0, -texelWidth)).a);
  int outlineW = computeFloatEncodedOutlineIndex(textureOffset(tDiffuse, uv, ivec2(-texelWidth, 0)).a);

  return ivec4(outlineN, outlineS, outlineE, outlineW);
}

int outlineIndex(sampler2D tDiffuse, vec2 uv) {
  int outlineIndex = computeFloatEncodedOutlineIndex(texture(tDiffuse, uv).a);
  ivec4 neighbours = computeNeighborOutlineIndices(tDiffuse, uv);
  bvec4 isEqualToPixel = equal(neighbours, ivec4(outlineIndex));
  bvec4 isMiss = equal(neighbours, ivec4(0));

  bvec4 isEqualOrMiss = bvec4(isEqualToPixel.x || isMiss.x, isEqualToPixel.y || isMiss.y, isEqualToPixel.z || isMiss.z, isEqualToPixel.w || isMiss.w);

  if(outlineIndex > 0 && !(all(isEqualToPixel)) && all(isEqualOrMiss)){
    return outlineIndex;
    // outline = vec4(texelFetch(tOutlineColors, ivec2(outlineIndex, 0), 0).rgb, 1.0);
  } else {
    return 0;
    // outline = vec4(0.0);
  }
}