precision highp float;

uniform sampler2D map;
uniform vec3 colorTint;
uniform float collectionOpacity;

in vec3 vColor;

out vec4 fragmentColor;

void main() {
  vec4 textureSample = texture(map, gl_PointCoord); 
  vec3 computedColor = mix(vColor, vec3(1.0), textureSample.r) ;
  vec2 centeredPointCoord = gl_PointCoord*2.0 - 1.0;
  
  #if defined(circular_overlay)
    if (length(centeredPointCoord) > 1.0) {
      discard;
    }
  #endif

  fragmentColor = vec4(computedColor * colorTint, textureSample.a * collectionOpacity);
}