uniform float linewidth;
uniform vec2 resolution;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

in vec3 position;
in vec3 instanceStart;
in vec3 instanceEnd;

out vec4 worldPos;
out vec3 worldStart;
out vec3 worldEnd;

void trimSegment(const in vec4 start, inout vec4 end) {
  float a = projectionMatrix[ 2 ][ 2 ];
  float b = projectionMatrix[ 3 ][ 2 ];
  float nearEstimate = - 0.5 * b / a;
  float alpha = (nearEstimate - start.z) / (end.z - start.z);

  end.xyz = mix(start.xyz, end.xyz, alpha);
}

void main() {
  mat4 modelViewMatrix = viewMatrix * modelMatrix;

  float aspect = resolution.x / resolution.y;

  // camera space
  vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
  vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);

  worldStart = start.xyz;
  worldEnd = end.xyz;

  bool perspective = (projectionMatrix[ 2 ][ 3 ] == - 1.0);

  if (perspective) {
    if (start.z < 0.0 && end.z >= 0.0) {
      trimSegment(start, end);
    } else if (end.z < 0.0 && start.z >= 0.0) {
      trimSegment(end, start);
    }
  }

  // clip space
  vec4 clipStart = projectionMatrix * start;
  vec4 clipEnd = projectionMatrix * end;

  // ndc space
  vec3 ndcStart = clipStart.xyz / clipStart.w;
  vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

  // direction
  vec2 dir = ndcEnd.xy - ndcStart.xy;

  // account for clip-space aspect ratio
  dir.x *= aspect;
  dir = normalize(dir);

  // get the offset direction as perpendicular to the view vector
  vec3 worldDir = normalize(end.xyz - start.xyz);
  vec3 offset;
  if (position.y < 0.5) {
    offset = normalize(cross(start.xyz, worldDir));
  } else {
    offset = normalize(cross(end.xyz, worldDir));
  }

  // sign flip
  if (position.x < 0.0) offset *= - 1.0;

  float forwardOffset = dot(worldDir, vec3(0.0, 0.0, 1.0));
  start.xyz += - worldDir * linewidth * 0.5;
  end.xyz += worldDir * linewidth * 0.5;
  offset.xy -= dir * forwardOffset;
  offset.z += 0.5;
  
  if (position.y > 1.0 || position.y < 0.0) {
    offset.xy += dir * 2.0 * forwardOffset;
  }
  // adjust for linewidth
  offset *= linewidth * 0.5;
  // set the world position
  worldPos = (position.y < 0.5) ? start : end;
  worldPos.xyz += offset;

  vec4 clip = projectionMatrix * worldPos;
  vec3 clipPose = (position.y < 0.5) ? ndcStart : ndcEnd;
  clip.z = clipPose.z * clip.w;

  gl_Position = clip;
  vec4 mvPosition = (position.y < 0.5) ? start : end; // this is an approximation
}