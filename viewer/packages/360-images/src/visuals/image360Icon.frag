precision highp float;

uniform sampler2D map;
uniform vec3 colorTint;

in float vertexAlpha;
out vec4 fragmentColor;

void main() {
  vec4 textureSample = texture(map, gl_PointCoord); 
  fragmentColor = vec4(textureSample.rgb * colorTint, vertexAlpha * textureSample.a);
}