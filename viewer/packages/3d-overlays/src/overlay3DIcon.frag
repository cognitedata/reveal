precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D clusterTexture;
uniform sampler2D numberTexture;

#if defined(isMaskDefined)
  uniform sampler2D maskTexture;
#endif

uniform vec3 colorTint;
uniform float collectionOpacity;

in vec3 vColor;
in float vIsCluster;
in float vClusterSize;

out vec4 fragmentColor;

// Helper function to get digit at position (0 = ones, 1 = tens, 2 = hundreds)
float getDigit(float number, float position) {
  float divisor = pow(10.0, position);
  return mod(floor(number / divisor), 10.0);
}

// Helper function to count digits in number
float countDigits(float number) {
  if (number < 10.0) return 1.0;
  if (number < 100.0) return 2.0;
  return 3.0;
}

void main() {
  // Use cluster texture for clusters, regular texture for individual points
  vec4 colorSample;
  if (vIsCluster > 0.5) {
    colorSample = texture(clusterTexture, gl_PointCoord);
  } else {
    colorSample = texture(colorTexture, gl_PointCoord);
  }

  float computedAlpha = colorSample.a;
  vec3 computedColor = colorSample.rgb;

  #if defined(isMaskDefined)
    vec4 maskSample;
    if (vIsCluster > 0.5) {
      maskSample = texture(clusterTexture, gl_PointCoord);
    } else {
      maskSample = texture(maskTexture, gl_PointCoord);
    }

    computedAlpha = colorSample.a + (1. - colorSample.a) * maskSample.r;
    computedColor = mix(colorSample.rgb, vColor, maskSample.r);
  #endif

  // Render number on top of cluster icons
  if (vIsCluster > 0.5 && vClusterSize >= 2.0) {
    vec2 centerCoord = gl_PointCoord - vec2(0.5);
    float digitCount = min(countDigits(vClusterSize), 3.0);

    // Scale number rendering - make numbers large and prominent
    float baseScale = 0.5; // Increased to 0.5 to cover 50% of sprite height
    float digitHeight = baseScale;
    float digitWidth = digitHeight * 0.65; // Aspect ratio for digits
    float totalWidth = digitWidth * digitCount;

    // Check if we're in the number rendering area (center of sprite)
    vec2 numberArea = abs(centerCoord);
    if (numberArea.x < totalWidth * 0.5 && numberArea.y < digitHeight * 0.5) {
      // Normalize coordinates to number rendering area
      vec2 numberCoord;
      numberCoord.x = (centerCoord.x + totalWidth * 0.5) / totalWidth;
      numberCoord.y = (centerCoord.y + digitHeight * 0.5) / digitHeight;

      // Clamp to valid range
      if (numberCoord.x >= 0.0 && numberCoord.x <= 1.0 && numberCoord.y >= 0.0 && numberCoord.y <= 1.0) {
        // Determine which digit we're rendering
        float digitIndex = floor(numberCoord.x * digitCount);
        digitIndex = clamp(digitIndex, 0.0, digitCount - 1.0);

        // Get the digit to render (left to right)
        float digitPos = digitCount - 1.0 - digitIndex;
        float digit = getDigit(vClusterSize, digitPos);

        // Calculate UV within the current digit
        float digitLocalX = fract(numberCoord.x * digitCount);

        // Sample from number texture atlas (10 digits in a row)
        vec2 digitUV;
        digitUV.x = (digit + digitLocalX) / 10.0;
        digitUV.y = 1.0 - numberCoord.y; // Flip Y to correct upside-down orientation

        vec4 numberSample = texture(numberTexture, digitUV);

        // Composite number on top with white color
        if (numberSample.a > 0.5) {
          computedColor = vec3(1.0);
          computedAlpha = 1.0;
        }
      }
    }
  }

  fragmentColor = vec4(computedColor * colorTint, computedAlpha * collectionOpacity);
}
