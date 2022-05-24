/*
  Takes a linear depth value between 0 and 1 and maps 
  it between the near and far plane.
*/
float toViewZ(float depth, float near, float far){
  float normalizedDepth = depth * 2.0 - 1.0;
  return 2.0 * near * far / (far + near - normalizedDepth * (far - near)); 
}