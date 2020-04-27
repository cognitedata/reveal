/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 *
 */

varying vec2 vUv;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform vec2 resolution;
uniform sampler2D tDiffuse;

#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif

vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
    vec2 v_rgbNW, vec2 v_rgbNE,
    vec2 v_rgbSW, vec2 v_rgbSE,
    vec2 v_rgbM) {
  vec4 color;
  mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
  vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
  vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
  vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
  vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
  vec4 texColor = texture2D(tex, v_rgbM);
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
      dir * rcpDirMin)) * inverseVP;

  vec4 rgbA = 0.5 * (
    texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)) +
    texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)));
  vec4 rgbB = rgbA * 0.5 + 0.25 * (
    texture2D(tex, fragCoord * inverseVP + dir * -0.5) +
    texture2D(tex, fragCoord * inverseVP + dir * 0.5));

  float lumaB = dot(rgbB.rgb, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
    color = rgbA;
  } else {
    color = rgbB;
  }
  return color;
}

void main() {
  vec2 fragCoord = vUv * resolution;
  gl_FragColor = fxaa(tDiffuse, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
