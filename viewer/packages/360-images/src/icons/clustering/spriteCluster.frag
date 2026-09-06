precision highp float;

uniform sampler2D ringTexture;
uniform sampler2D hoverRingTexture;
uniform sampler2D digitAtlas;
uniform float collectionOpacity;

in vec4 vDigits;
in vec3 vClusterMeta;

out vec4 fragmentColor;

const float ATLAS_COLUMNS = 4.0;
const float UNUSED_GLYPH = 11.0;

vec2 atlasUv(float glyph, vec2 localUv) {
  float column = mod(glyph, ATLAS_COLUMNS);
  float row = floor(glyph / ATLAS_COLUMNS);
  return (vec2(column, row) + localUv) / ATLAS_COLUMNS;
}

float digitWidthForCount(float digitCount) {
  if (digitCount >= 4.0) {
    return 0.11;
  }
  if (digitCount >= 3.0) {
    return 0.14;
  }
  if (digitCount >= 2.0) {
    return 0.175;
  }
  return 0.22;
}

void main() {
  vec2 uv = gl_PointCoord;
  float digitCount = vClusterMeta.x;
  float fadeOpacity = vClusterMeta.y;
  float hover = vClusterMeta.z;

  vec4 ringSample = mix(texture(ringTexture, uv), texture(hoverRingTexture, uv), hover);
  vec4 color = ringSample;

  float digitHeight = 0.30;
  float digitWidth = digitWidthForCount(digitCount);
  float totalWidth = digitCount * digitWidth;
  vec2 origin = vec2(0.5 - totalWidth * 0.5, 0.5 - digitHeight * 0.5);
  vec2 local = uv - origin;

  if (local.x >= 0.0 && local.x < totalWidth && local.y >= 0.0 && local.y < digitHeight) {
    float slot = floor(local.x / digitWidth);
    float glyph = slot < 1.0 ? vDigits.x : slot < 2.0 ? vDigits.y : slot < 3.0 ? vDigits.z : vDigits.w;

    if (glyph < UNUSED_GLYPH) {
      vec2 glyphUv = vec2(fract(local.x / digitWidth), local.y / digitHeight);
      vec4 digitSample = texture(digitAtlas, atlasUv(glyph, glyphUv));
      color.rgb = mix(color.rgb, digitSample.rgb, digitSample.a);
      color.a = max(color.a, digitSample.a);
    }
  }

  fragmentColor = vec4(color.rgb, color.a * fadeOpacity * collectionOpacity);
}
