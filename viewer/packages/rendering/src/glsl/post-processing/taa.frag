precision highp float;

// Current frame
uniform sampler2D tCurrent;
uniform sampler2D tCurrentDepth;

// Previous frame
uniform sampler2D tHistory;
uniform sampler2D tHistoryDepth;

// Camera matrices for reprojection
uniform mat4 prevViewProjMatrix;
uniform mat4 invViewProjMatrix;

// TAA parameters
uniform vec2 jitterOffset;      // Current frame jitter
uniform float blendFactor;      // How much to blend with history (0.1 = 90% history, 10% current)
uniform float velocityThreshold; // Threshold for detecting motion

in vec2 vUv;
out vec4 outputColor;

// Convert depth to world position
vec3 worldPosFromDepth(float depth, vec2 uv) {
  vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 worldSpace = invViewProjMatrix * clipSpace;
  return worldSpace.xyz / worldSpace.w;
}

// Reproject current pixel to previous frame
vec2 reprojectToHistory(vec2 currentUv, float currentDepth) {
  // Get world position from current frame
  vec3 worldPos = worldPosFromDepth(currentDepth, currentUv);
  
  // Project to previous frame's clip space
  vec4 prevClipPos = prevViewProjMatrix * vec4(worldPos, 1.0);
  prevClipPos.xyz /= prevClipPos.w;
  
  // Convert to UV coordinates
  vec2 prevUv = prevClipPos.xy * 0.5 + 0.5;
  
  return prevUv;
}

// Clamp color to neighborhood (reduces ghosting on moving objects)
vec3 clampToNeighborhood(vec3 color, vec2 uv) {
  // Sample 3x3 neighborhood
  vec3 minColor = vec3(1000.0);
  vec3 maxColor = vec3(-1000.0);
  vec3 m1 = vec3(0.0);
  vec3 m2 = vec3(0.0);
  
  vec2 texelSize = 1.0 / vec2(textureSize(tCurrent, 0));
  
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 offset = vec2(float(x), float(y)) * texelSize;
      vec3 sample = texture(tCurrent, uv + offset).rgb;
      
      minColor = min(minColor, sample);
      maxColor = max(maxColor, sample);
      
      // Calculate mean and variance for better clamping
      m1 += sample;
      m2 += sample * sample;
    }
  }
  
  // Variance-based clamping (more accurate than min/max)
  m1 /= 9.0;
  m2 /= 9.0;
  
  vec3 sigma = sqrt(max(m2 - m1 * m1, 0.0));
  vec3 boxMin = m1 - 1.5 * sigma;
  vec3 boxMax = m1 + 1.5 * sigma;
  
  return clamp(color, boxMin, boxMax);
}

// Detect if pixel is valid (not off-screen, not disoccluded)
bool isHistoryValid(vec2 historyUv, float currentDepth, float historyDepth) {
  // Check if history UV is in valid range
  if (historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0) {
    return false;
  }
  
  // Check for disocclusion (depth mismatch indicating geometry change)
  float depthDiff = abs(currentDepth - historyDepth);
  if (depthDiff > 0.01) {  // Threshold for depth difference
    return false;
  }
  
  return true;
}

void main() {
  // Sample current frame (with jitter removed for stable sampling)
  vec2 currentUv = vUv - jitterOffset;
  vec3 currentColor = texture(tCurrent, vUv).rgb;
  float currentDepth = texture(tCurrentDepth, vUv).r;
  
  // Skip TAA for background/sky
  if (currentDepth >= 1.0) {
    outputColor = vec4(currentColor, 1.0);
    return;
  }
  
  // Reproject to previous frame
  vec2 historyUv = reprojectToHistory(vUv, currentDepth);
  vec3 historyColor = texture(tHistory, historyUv).rgb;
  float historyDepth = texture(tHistoryDepth, historyUv).r;
  
  // Check if history is valid
  bool validHistory = isHistoryValid(historyUv, currentDepth, historyDepth);
  
  if (!validHistory) {
    // No valid history - use current frame only
    outputColor = vec4(currentColor, 1.0);
    return;
  }
  
  // Clamp history to current frame's neighborhood (reduces ghosting)
  historyColor = clampToNeighborhood(historyColor, vUv);
  
  // Calculate velocity (pixel movement between frames)
  vec2 velocity = historyUv - vUv;
  float velocityMag = length(velocity);
  
  // Adaptive blend factor based on motion
  // More motion = use more current frame (less history)
  float adaptiveBlend = mix(blendFactor, 0.5, smoothstep(0.0, velocityThreshold, velocityMag));
  
  // Blend current and history
  vec3 finalColor = mix(historyColor, currentColor, adaptiveBlend);
  
  outputColor = vec4(finalColor, 1.0);
}

