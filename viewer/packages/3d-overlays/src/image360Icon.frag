precision highp float;

uniform sampler2D map;
uniform vec3 colorTint;
uniform float collectionOpacity;

in vec3 vColor;

out vec4 fragmentColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  vec4 textureSample = texture(map, gl_PointCoord); 
  if (textureSample.a <= 0.1) {
    discard;
  }
  fragmentColor = vec4(vColor * textureSample.rgb * colorTint, textureSample.a * collectionOpacity);
}