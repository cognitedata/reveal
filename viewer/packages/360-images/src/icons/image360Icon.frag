precision highp float;

uniform sampler2D map;
uniform vec3 colorTint;
uniform float collectionOpacity;

out vec4 fragmentColor;

void main() {
  vec4 textureSample = texture(map, gl_PointCoord); 
  fragmentColor = vec4(textureSample.rgb * colorTint, textureSample.a * collectionOpacity);
}