varying vec2 vUv;

uniform mat4 projMatrix;
uniform mat4 inverseProjectionMatrix;

uniform vec3 kernel[MAX_KERNEL_SIZE];

uniform sampler2D tDepth;
uniform sampler2D tNoise;

uniform vec2 resolution;

uniform float sampleRadius;
uniform float bias;

vec3 viewPosFromDepth(float depth, vec2 uv) {
  // Depth to clip space: [0, 1] -> [-1, 1]
  float z = depth * 2.0 - 1.0;

  // Fragment in clip space
  vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
  vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;

  // Perspective division
  viewSpacePosition /= viewSpacePosition.w;

  return viewSpacePosition.xyz;
}

vec3 computeWorldNormalFromDepth(sampler2D depthTexture, vec2 resolution, vec2 uv, float sampleDepth){
  float dx = 1.0 / resolution.x;
  float dy = 1.0 / resolution.y;

  vec2 uv1 = uv + vec2(dx, 0.0); // right
  float d1 = texture2D(depthTexture, uv1).r; 

  vec2 uv2 = uv + vec2(0.0, dy);  // up
  float d2 = texture2D(depthTexture, uv2).r;

  vec2 uv3 = uv + vec2(-dx, 0.0); // left
  float d3 = texture2D(depthTexture, uv3).r;

  vec2 uv4 = uv + vec2(0.0, -dy);  // down
  float d4 = texture2D(depthTexture, uv4).r;

  bool horizontalSampleCondition = abs(d1 - sampleDepth) < abs(d3 - sampleDepth);

  float horizontalSampleDepth = horizontalSampleCondition ? d1 : d3;
  vec2 horizontalSampleUv = horizontalSampleCondition ? uv1 : uv3;

  bool verticalSampleCondition = abs(d2 - sampleDepth) < abs(d4 - sampleDepth);

  float verticalSampleDepth = verticalSampleCondition ? d2 : d4;
  vec2 verticalSampleUv = verticalSampleCondition ? uv2 : uv4;

  vec3 viewPos = viewPosFromDepth(sampleDepth, vUv);
  
  vec3 viewPos1 = (horizontalSampleCondition == verticalSampleCondition) ? viewPosFromDepth(horizontalSampleDepth, horizontalSampleUv) : viewPosFromDepth(verticalSampleDepth, verticalSampleUv);
  vec3 viewPos2 = (horizontalSampleCondition == verticalSampleCondition) ? viewPosFromDepth(verticalSampleDepth, verticalSampleUv) : viewPosFromDepth(horizontalSampleDepth, horizontalSampleUv);

  return normalize(cross(viewPos1 - viewPos, viewPos2 - viewPos));
}

void main(){
  float d = texture2D(tDepth, vUv).r;

  vec3 viewNormal = computeWorldNormalFromDepth(tDepth, resolution, vUv, d);

  vec3 viewPosition = viewPosFromDepth(d, vUv);

  vec2 noiseScale = vec2( resolution.x / 128.0, resolution.y / 128.0 );
  vec3 randomVec = normalize(texture2D(tNoise, vUv * noiseScale).xyz);

  vec3 tangent = normalize(randomVec - viewNormal * dot(randomVec, viewNormal));

  vec3 bitangent = cross(viewNormal, tangent);

  mat3 TBN = mat3(tangent, bitangent, viewNormal);

  float occlusion = 0.0;

  for (int i = 0; i < MAX_KERNEL_SIZE; i++){
    
    vec3 sampleVector = TBN * kernel[i];
    sampleVector = viewPosition + sampleVector * sampleRadius;

    vec4 offset = projMatrix * vec4(sampleVector, 1.0);
    offset.xyz /= offset.w;
    offset.xyz = offset.xyz * 0.5 + 0.5;

    float realDepth = texture2D(tDepth, offset.xy).r;
    vec3 realPos = viewPosFromDepth(realDepth, offset.xy);

    float rangeCheck = smoothstep(0.0, 1.0, sampleRadius / length(viewPosition - realPos));

    occlusion += (realPos.z >= sampleVector.z + bias ? 1.0 : 0.0) * rangeCheck;
  }

  float occlusionFactor = 1.0 - clamp(occlusion / float(MAX_KERNEL_SIZE), 0.0, 1.0);

  gl_FragColor = vec4(vec3(occlusionFactor), 1.0);
}