precision highp float;

uniform vec3 color;
uniform float opacity;
uniform float linewidth;

in float vLineDistance;
in vec4 worldPos;
in vec3 worldStart;
in vec3 worldEnd;

out vec4 outputColor;

vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {
  float mua;
  float mub;

  vec3 p13 = p1 - p3;
  vec3 p43 = p4 - p3;
  vec3 p21 = p2 - p1;

  float d1343 = dot(p13, p43);
  float d4321 = dot(p43, p21);
  float d1321 = dot(p13, p21);
  float d4343 = dot(p43, p43);
  float d2121 = dot(p21, p21);

  float denom = d2121 * d4343 - d4321 * d4321;
  float numer = d1343 * d4321 - d1321 * d4343;
  mua = numer / denom;
  mua = clamp(mua, 0.0, 1.0);
  mub = (d1343 + d4321 * (mua)) / d4343;
  mub = clamp(mub, 0.0, 1.0);

  return vec2(mua, mub);
}

void main() {
  float alpha = opacity;

    // Find the closest points on the view ray and the line segment
  vec3 rayEnd = normalize(worldPos.xyz) * 1e5;
  vec3 lineDir = worldEnd - worldStart;
  vec2 params = closestLineToLine(worldStart, worldEnd, vec3(0.0, 0.0, 0.0), rayEnd);

  vec3 p1 = worldStart + lineDir * params.x;
  vec3 p2 = rayEnd * params.y;
  vec3 delta = p1 - p2;
  float len = length(delta);
  float norm = len / linewidth;

  if (norm > 0.5) {
    discard;
  }

  outputColor = vec4(color, alpha);
}