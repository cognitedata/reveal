// Copyright Cognite (C) 2021 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
// generalized for two dimensions

vec4 gaussianBlur(sampler2D tDiffuse, vec2 uv) {
  ivec2 textureSize = textureSize(tDiffuse, 0);
  vec2 resolution = vec2(float(textureSize.x), float(textureSize.y));

  return texture(tDiffuse, uv + vec2(-3.1111111, -3.1111111) / resolution) * 0.0012360 +
         texture(tDiffuse, uv + vec2(-1.3333333, -3.1111111) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(-3.1111111, -1.3333333) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(-1.3333333, -1.3333333) / resolution) * 0.1076660 +
         texture(tDiffuse, uv + vec2(0.0000000, -3.1111111) / resolution) * 0.0096130 +
         texture(tDiffuse, uv + vec2(0.0000000, -1.3333333) / resolution) * 0.0897217 +
         texture(tDiffuse, uv + vec2(1.3333333, -3.1111111) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(3.1111111, -3.1111111) / resolution) * 0.0012360 +
         texture(tDiffuse, uv + vec2(1.3333333, -1.3333333) / resolution) * 0.1076660 +
         texture(tDiffuse, uv + vec2(3.1111111, -1.3333333) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(-3.1111111, 0.0000000) / resolution) * 0.0096130 +
         texture(tDiffuse, uv + vec2(-1.3333333, 0.0000000) / resolution) * 0.0897217 +
         texture(tDiffuse, uv + vec2(-3.1111111, 1.3333333) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(-1.3333333, 1.3333333) / resolution) * 0.1076660 +
         texture(tDiffuse, uv + vec2(-3.1111111, 3.1111111) / resolution) * 0.0012360 +
         texture(tDiffuse, uv + vec2(-1.3333333, 3.1111111) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(0.0000000, 1.3333333) / resolution) * 0.0897217 +
         texture(tDiffuse, uv + vec2(0.0000000, 3.1111111) / resolution) * 0.0096130 +
         texture(tDiffuse, uv + vec2(1.3333333, 1.3333333) / resolution) * 0.1076660 +
         texture(tDiffuse, uv + vec2(3.1111111, 1.3333333) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(1.3333333, 3.1111111) / resolution) * 0.0115356 +
         texture(tDiffuse, uv + vec2(3.1111111, 3.1111111) / resolution) * 0.0012360 +
         texture(tDiffuse, uv + vec2(1.3333333, 0.0000000) / resolution) * 0.0897217 +
         texture(tDiffuse, uv + vec2(3.1111111, 0.0000000) / resolution) * 0.0096130 +
         texture(tDiffuse, uv) * 0.0747681;
}
