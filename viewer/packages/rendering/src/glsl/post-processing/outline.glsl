#pragma glslify: import('../math/floatBitsSubset.glsl')

const int texelOffset = 2;

int computeFloatEncodedOutlineIndex(float bitEncodedFloat){
  return int(floatBitsSubset(floor((bitEncodedFloat * 255.0) + 0.5), 5, 8));
}

ivec4 computeNeighborOutlineIndices(sampler2D tDiffuse, ivec2 fragCoord){
  int outlineN = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, fragCoord, 0, ivec2(0, texelOffset)).a);
  int outlineS = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, fragCoord, 0, ivec2(texelOffset, 0)).a);
  int outlineE = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, fragCoord, 0, ivec2(0, -texelOffset)).a);
  int outlineW = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, fragCoord, 0, ivec2(-texelOffset, 0)).a);

  return ivec4(outlineN, outlineS, outlineE, outlineW);
}

int fetchOutlineIndex(sampler2D tDiffuse) {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);
  int outlineIndex = computeFloatEncodedOutlineIndex(texelFetch(tDiffuse, fragCoord, 0).a);
  ivec4 neighbours = computeNeighborOutlineIndices(tDiffuse, fragCoord);
  bvec4 isEqualToPixel = equal(neighbours, ivec4(outlineIndex));
  bvec4 isMiss = equal(neighbours, ivec4(0));

  bvec4 isEqualOrMiss = bvec4(isEqualToPixel.x || isMiss.x, isEqualToPixel.y || isMiss.y, isEqualToPixel.z || isMiss.z, isEqualToPixel.w || isMiss.w);

  bool hasOutline = outlineIndex > 0 && !(all(isEqualToPixel)) && all(isEqualOrMiss);

  return hasOutline ? outlineIndex : 0;
}