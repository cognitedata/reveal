precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D clusterTexture;
uniform sampler2D numberTexture;

#if defined(isMaskDefined)
  uniform sampler2D maskTexture;
#endif

uniform vec3 colorTint;
uniform float collectionOpacity;

const vec3 hoverTintColor = vec3(0.475, 0.525, 0.796); // #7986cb - soft blue/purple

in vec3 vColor;
in float vIsCluster;
in float vClusterSize;
in float vIsHovered;

out vec4 fragmentColor;

// Digit extraction - step-based lookup for positions 0-2
float getDigit(float number, float position) {
  float roundedNumber = floor(number + 0.5);
  // Use step functions instead of pow(10, position) for better SIMD performance
  float divisor = 1.0 + step(0.5, position) * 9.0 + step(1.5, position) * 90.0;
  return mod(floor(roundedNumber / divisor), 10.0);
}

float countDigits(float number) {
  float roundedNumber = floor(number + 0.5);
  return 1.0 + step(10.0, roundedNumber) + step(100.0, roundedNumber);
}

void main() {
  // Cache cluster check as float for branchless operations
  float isCluster = step(0.5, vIsCluster);
  float isHovered = step(0.5, vIsHovered);

  // Texture sampling - sample both textures and blend
  vec4 regularSample = texture(colorTexture, gl_PointCoord);
  vec4 clusterSample = texture(clusterTexture, gl_PointCoord);
  vec4 colorSample = mix(regularSample, clusterSample, isCluster);

  float computedAlpha = colorSample.a;
  vec3 computedColor = colorSample.rgb;

  #if defined(isMaskDefined)
    // Mask sampling
    vec4 maskRegular = texture(maskTexture, gl_PointCoord);
    vec4 maskSample = mix(maskRegular, clusterSample, isCluster);

    computedAlpha = colorSample.a + (1.0 - colorSample.a) * maskSample.r;
    computedColor = mix(colorSample.rgb, vColor, maskSample.r);
  #endif

  // Hover tint for clusters
  // Calculate tinted version then blend based on conditions
  float minChannel = min(min(computedColor.r, computedColor.g), computedColor.b);
  float isWhite = step(0.9, minChannel);
  float luminance = dot(computedColor, vec3(0.299, 0.587, 0.114));
  vec3 tintedColor = mix(hoverTintColor * 0.5, hoverTintColor * 1.2, luminance);
  vec3 hoverColor = mix(tintedColor, computedColor, isWhite);

  // Apply hover effect only for hovered clusters
  float applyHover = isCluster * isHovered;
  computedColor = mix(computedColor, hoverColor, applyHover);

  // Number rendering for clusters with size >= 2
  float roundedClusterSize = floor(vClusterSize + 0.5);
  float shouldRenderNumber = isCluster * step(2.0, roundedClusterSize);

  // Only process number rendering if needed
  if (shouldRenderNumber > 0.5) {
    vec2 centerCoord = gl_PointCoord - vec2(0.5);

    // Branchless showPlus and charCount calculation
    float showPlus = step(99.5, roundedClusterSize);
    float displaySize = min(roundedClusterSize, 99.0);
    float normalCharCount = min(countDigits(displaySize), 2.0);
    float charCount = mix(normalCharCount, 3.0, showPlus);

    // Branchless scale selection
    float baseScale = mix(0.35, 0.28, showPlus);
    float charHeight = baseScale;
    float charWidth = charHeight * 0.667;

    // Control spacing by sampling only the center portion of each atlas cell
    float cellUsage = 0.65;
    float effectiveCharWidth = charWidth * cellUsage;
    float totalWidth = effectiveCharWidth * charCount;

    // Check if we're in the number rendering area
    vec2 numberArea = abs(centerCoord);
    float inNumberArea = step(numberArea.x, totalWidth * 0.5) * step(numberArea.y, charHeight * 0.5);

    if (inNumberArea > 0.5) {
      // Normalize coordinates to number rendering area
      vec2 numberCoord;
      numberCoord.x = (centerCoord.x + totalWidth * 0.5) / totalWidth;
      numberCoord.y = (centerCoord.y + charHeight * 0.5) / charHeight;

      // Clamp coordinates
      numberCoord = clamp(numberCoord, 0.0, 1.0);

      // Determine which character we're rendering
      float charIndex = floor(numberCoord.x * charCount);
      charIndex = clamp(charIndex, 0.0, charCount - 1.0);

      // Character value calculation for "99+" case
      // For showPlus: charIndex 0,1 -> 9, charIndex 2 -> 10
      float plusCharValue = 9.0 + step(1.5, charIndex); // 9 for idx 0,1; 10 for idx 2

      // For normal numbers
      float digitPos = charCount - 1.0 - charIndex;
      float normalCharValue = getDigit(displaySize, digitPos);

      // Select based on showPlus (branchless)
      float charValue = mix(normalCharValue, plusCharValue, showPlus);

      // Calculate UV within the current character
      float charLocalX = fract(numberCoord.x * charCount);

      // Map to sample only the center portion of the cell
      float cellPadding = (1.0 - cellUsage) * 0.5;
      float mappedLocalX = cellPadding + charLocalX * cellUsage;

      // Sample from number texture atlas
      vec2 charUV;
      charUV.x = (charValue + mappedLocalX) / 11.0;
      charUV.y = 1.0 - numberCoord.y;

      vec4 numberSample = texture(numberTexture, charUV);

      // Blend based on alpha threshold
      float showNumber = step(0.5, numberSample.a);
      computedColor = mix(computedColor, vec3(1.0), showNumber);
      computedAlpha = mix(computedAlpha, 1.0, showNumber);
    }
  }

  fragmentColor = vec4(computedColor * colorTint, computedAlpha * collectionOpacity);
}
