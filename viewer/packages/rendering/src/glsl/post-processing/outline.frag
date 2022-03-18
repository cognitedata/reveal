precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tOutlineColors;

out vec4 outline;

#pragma glslify: import('../math/floatBitsSubset.glsl')

int computeFloatEncodedOutlineIndex(float bitEncodedFloat){
  return int(floatBitsSubset(floor((bitEncodedFloat * 255.0) + 0.5), 5, 8));
}

ivec4 computeNeighborOutlineIndices(){
  ivec2 base = ivec2(gl_FragCoord.xy);
  const int texelWidth = 2;
  int outlineN = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, base, 0, ivec2(0, texelWidth)).a);
  int outlineS = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, base, 0, ivec2(texelWidth, 0)).a);
  int outlineE = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, base, 0, ivec2(0, -texelWidth)).a);
  int outlineW = computeFloatEncodedOutlineIndex(texelFetchOffset(tDiffuse, base, 0, ivec2(-texelWidth, 0)).a);

  return ivec4(outlineN, outlineS, outlineE, outlineW);
}

void main() {
  ivec2 textureSize = textureSize(tDiffuse, 0);
  int outlineIndex = computeFloatEncodedOutlineIndex(texelFetch(tDiffuse, ivec2(gl_FragCoord.xy), 0).a);
  ivec4 neighbours = computeNeighborOutlineIndices();
  if(outlineIndex > 0 && !(all(equal(neighbours, ivec4(outlineIndex))))){
    outline = vec4(texelFetch(tOutlineColors, ivec2(outlineIndex, 0), 0).rgb, 1.0);
  } else {
    outline = vec4(0.0);
  }
}