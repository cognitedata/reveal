// Ambient occlusion based on N8AO by N8python (https://github.com/N8python/n8ao), adapted to Reveal's
// render pipeline. N8AO is dedicated to the public domain under CC0 1.0 Universal
// (https://creativecommons.org/publicdomain/zero/1.0/); its author asks to be credited when it's used.
//
// Downsamples depth to half resolution for half resolution ambient occlusion. Picks one of the four
// full resolution depths (alternating between nearest and farthest in a checkerboard pattern, so both
// sides of depth discontinuities are represented) and stores it with the normal reconstructed at full
// resolution, and which of the four pixels was picked: (depth, octahedral normal, subpixel index).

precision highp float;

#include n8ao-common.glsl;

uniform highp sampler2D tDepth;

in vec2 vUv;

out vec4 outputColor;

void main() {
  ivec2 fullSize = textureSize(tDepth, 0);
  ivec2 halfPixel = ivec2(vUv * vec2(fullSize / 2));
  ivec2 basePixel = halfPixel * 2;

  ivec2 pixels[4];
  pixels[0] = basePixel;
  pixels[1] = basePixel + ivec2(1, 0);
  pixels[2] = basePixel + ivec2(0, 1);
  pixels[3] = basePixel + ivec2(1, 1);

  float depths[4];
  for (int i = 0; i < 4; i++) {
    depths[i] = fetchDepth(tDepth, pixels[i], fullSize);
  }

  float minDepth = min(min(depths[0], depths[1]), min(depths[2], depths[3]));
  float maxDepth = max(max(depths[0], depths[1]), max(depths[2], depths[3]));
  float targetDepth = (halfPixel.x + halfPixel.y) % 2 == 1 ? maxDepth : minDepth;

  int chosenIndex = 0;
  for (int i = 0; i < 4; i++) {
    if (depths[i] == targetDepth) {
      chosenIndex = i;
      break;
    }
  }

  vec3 normal = isBackground(targetDepth) ? vec3(0.0, 0.0, 1.0) : computeViewNormal(tDepth, pixels[chosenIndex]);
  outputColor = vec4(targetDepth, encodeNormal(normal), float(chosenIndex));
}
