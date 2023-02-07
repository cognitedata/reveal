precision highp float;

uniform sampler2D map;
out vec4 color;

void main() {
  color = texture(map, gl_PointCoord);
}