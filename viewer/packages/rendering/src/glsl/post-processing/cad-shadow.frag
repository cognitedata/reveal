precision highp float;

uniform sampler2D tDepth;

in vec2 vUv;

out vec4 fragColor;

#include cadShadow.glsl;

#ifdef CAD_SHADOW_FOCUS_PROBE

uniform float cameraFar;

const int CAD_SHADOW_PROBE_GRID = 7;
const float CAD_SHADOW_PROBE_EXTENT = 0.4;

void main() {
  float logSum = 0.0;
  float count = 0.0;
  for (int y = 0; y < CAD_SHADOW_PROBE_GRID; y++) {
    for (int x = 0; x < CAD_SHADOW_PROBE_GRID; x++) {
      vec2 cell = vec2(float(x), float(y)) / float(CAD_SHADOW_PROBE_GRID - 1) - 0.5;
      vec2 uv = 0.5 + cell * CAD_SHADOW_PROBE_EXTENT;
      float depth = texture(tDepth, uv).r;
      if (depth < CAD_SHADOW_EMPTY_DEPTH) {
        float distance = -cadShadowViewPosFromDepth(depth, uv).z;
        if (distance > 0.0) {
          logSum += log(distance);
          count += 1.0;
        }
      }
    }
  }

  if (count < 0.5) {
    fragColor = vec4(0.0);
    return;
  }

  float normalized = clamp(exp(logSum / count) / max(cameraFar, 1.0e-6), 0.0, 1.0);
  vec3 packed = fract(normalized * vec3(1.0, 255.0, 65025.0));
  packed -= packed.yzz * vec3(1.0 / 255.0, 1.0 / 255.0, 0.0);
  fragColor = vec4(packed, 1.0);
}

#else

void main() {
  float lit = cadShadowLit(tDepth, vUv);
  fragColor = vec4(lit, lit, lit, 1.0);
}

#endif
