/*
  Takes a linear depth value between 0 and 1 and maps 
  it between the near and far plane.

  Adapted from https://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
*/

float toViewZ(float depth, float near, float far){
  return near * far / (far - depth * (far - near)); 
}