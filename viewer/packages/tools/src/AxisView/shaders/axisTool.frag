precision highp float;

uniform sampler2D tex;

in vec2 vUv;

out vec4 color;

void main()
{
  color = texture(tex, vUv);  
}
