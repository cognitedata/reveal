/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 */
 
#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif

vec4 fxaa(sampler2D tex) {
  vec4 color;

  vec2 fragCoord = gl_FragCoord.xy;

  ivec2 textureSize = textureSize(tDiffuse, 0);
  vec2 resolution = vec2(float(textureSize.x), float(textureSize.y));
  vec2 inverseResolution = vec2(1.0 / resolution.x, 1.0 / resolution.y);

  vec2 v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseResolution;
  vec2 v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseResolution;
  vec2 v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseResolution;
  vec2 v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseResolution;
  vec2 v_rgbM = vec2(fragCoord * inverseResolution);

  vec3 rgbNW = texture(tex, v_rgbNW).xyz;
  vec3 rgbNE = texture(tex, v_rgbNE).xyz;
  vec3 rgbSW = texture(tex, v_rgbSW).xyz;
  vec3 rgbSE = texture(tex, v_rgbSE).xyz;
  vec4 texColor = texture(tex, v_rgbM);
  vec3 rgbM  = texColor.xyz;

  vec3 luma = vec3(0.299, 0.587, 0.114);
  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM  = dot(rgbM,  luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  mediump vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                  (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
      max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
      dir * rcpDirMin));

  vec4 rgbA = 0.5 * (
    texture(tex, inverseResolution * (fragCoord + dir * (1.0 / 3.0 - 0.5))) +
    texture(tex, inverseResolution * (fragCoord + dir * (2.0 / 3.0 - 0.5))));
  vec4 rgbB = rgbA * 0.5 + 0.25 * (
    texture(tex, inverseResolution * (fragCoord + dir * -0.5)) +
    texture(tex, inverseResolution * (fragCoord + dir * 0.5)));

  float lumaB = dot(rgbB.rgb, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
    color = rgbA;
  } else {
    color = rgbB;
  }
  return color;
}