uniform sampler2D frontTexture;
uniform sampler2D backTexture;

varying vec2 vUv;

void main(){
  vec4 front = texture2D(frontTexture, vUv);
  vec4 back = texture2D(backTexture, vUv);

  gl_FragColor = front * (front.a) + back * (1 - front.a);
}