precision highp float;
precision highp int;

#pragma glslify: import('../base/pointSizeRelativeToScreen.glsl');
#pragma glslify: import('../base/isClipped.glsl');

#define max_clip_boxes 30

in vec3 position;
in vec3 color;
in float intensity;
in float classification;
in float objectId;
in vec4 indices;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

uniform float screenWidth;
uniform float screenHeight;
uniform float fov;
uniform float spacing;

uniform float heightMin;
uniform float heightMax;
uniform float size; // pixel size factor
uniform float minSize; // minimum pixel size
uniform float maxSize; // maximum pixel size
uniform float octreeSize;
uniform float level;
uniform float vnStart;
uniform bool isLeafNode;

uniform vec2 intensityRange;
uniform float intensityGamma;
uniform float intensityContrast;
uniform float intensityBrightness;
uniform float rgbGamma;
uniform float rgbContrast;
uniform float rgbBrightness;

uniform sampler2D visibleNodes;
uniform sampler2D gradient;
uniform sampler2D classificationLUT;
uniform sampler2D objectIdLUT;

out vec3 vColor;

#if defined(weighted_splats)
	out float vLinearDepth;
#endif

#if defined(use_edl)
	out float vLogDepth;
#endif

#if defined(weighted_splats) || defined(paraboloid_point_shape) || defined(hq_depth_pass)
	out float vRadius;
	out vec3 vViewPosition;
#endif

#if defined(adaptive_point_size) || defined(color_type_lod)

/**
 * Gets the number of 1-bits up to inclusive index position.
 *
 * number is treated as if it were an integer in the range 0-255
 */
int numberOfOnes(int number, int index) {
	int numOnes = 0;
	int tmp = 128;
	for (int i = 7; i >= 0; i--) {

		if (number >= tmp) {
			number = number - tmp;

			if (i <= index) {
				numOnes++;
			}
		}

		tmp = tmp / 2;
	}

	return numOnes;
}

/**
 * Checks whether the bit at index is 1.0
 *
 * number is treated as if it were an integer in the range 0-255
 */
bool isBitSet(int number, int index){

	// weird multi else if due to lack of proper array, int and bitwise support in WebGL 1.0
	int powi = 1;
	if (index == 0) {
		powi = 1;
	} else if (index == 1) {
		powi = 2;
	} else if (index == 2) {
		powi = 4;
	} else if (index == 3) {
		powi = 8;
	} else if (index == 4) {
		powi = 16;
	} else if (index == 5) {
		powi = 32;
	} else if (index == 6) {
		powi = 64;
	} else if (index == 7) {
		powi = 128;
	}

	int ndp = number / powi;

	return mod(float(ndp), 2.0) != 0.0;
}

/**
 * Gets the the LOD at the point position.
 */
float getLOD() {
	vec3 offset = vec3(0.0, 0.0, 0.0);
	int iOffset = int(vnStart);
	float depth = level;

	for (float i = 0.0; i <= 30.0; i++) {
		float nodeSizeAtLevel = octreeSize  / pow(2.0, i + level + 0.0);

		vec3 index3d = (position-offset) / nodeSizeAtLevel;
		index3d = floor(index3d + 0.5);
		int index = int(round(4.0 * index3d.x + 2.0 * index3d.y + index3d.z));

		vec4 value = texture(visibleNodes, vec2(float(iOffset) / 2048.0, 0.0));
		int mask = int(round(value.r * 255.0));

		if (isBitSet(mask, index)) {
			// there are more visible child nodes at this position
			int advanceG = int(round(value.g * 255.0)) * 256;
			int advanceB = int(round(value.b * 255.0));
			int advanceChild = numberOfOnes(mask, index - 1);
			int advance = advanceG + advanceB + advanceChild;

			iOffset = iOffset + advance;

			depth++;
		} else {
			return value.a * 255.0; // no more visible child nodes at this position
		}

		offset = offset + (vec3(1.0, 1.0, 1.0) * nodeSizeAtLevel * 0.5) * index3d;
	}

	return depth;
}

float getPointSizeAttenuation() {
	return 0.5 * pow(2.0, getLOD());
}

#endif

// formula adapted from: http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
float getContrastFactor(float contrast) {
	return (1.0158730158730156 * (contrast + 1.0)) / (1.0158730158730156 - contrast);
}

vec3 getRGB() {
        return color;
}

float getIntensity() {
	float w = (intensity - intensityRange.x) / (intensityRange.y - intensityRange.x);
	w = pow(w, intensityGamma);
	w = w + intensityBrightness;
	w = (w - 0.5) * getContrastFactor(intensityContrast) + 0.5;
	w = clamp(w, 0.0, 1.0);

	return w;
}

vec3 getRgbWithIntensityFallback() {
	vec3 rgb = getRGB();
	float intensity = getIntensity();
	return rgb != vec3(0.0) ? rgb : vec3(intensity);
}

vec3 getElevation() {
	vec4 world = modelMatrix * vec4( position, 1.0 );
	float w = (world.y - heightMin) / (heightMax-heightMin);
	vec3 cElevation = texture(gradient, vec2(w,1.0-w)).rgb;

	return cElevation;
}

vec4 getClassification() {
	vec2 uv = vec2(classification / 255.0, 0.5);
	vec4 classColor = texture(classificationLUT, uv);

	return classColor;
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
		#if defined paraboloid_point_shape
			vViewPosition = mvPosition.xyz;
		#endif

    vec4 classification = getClassification();
    float outColorAlpha = classification.a;

	gl_Position = projectionMatrix * mvPosition;

	#if defined weighted_splats
		vLinearDepth = gl_Position.w;
	#endif

	#if defined(use_edl)
		// Division by 10 is added to make depth values more "flat" so that EDL effect is visible at distance.
		vLogDepth = log2(-mvPosition.z)/10.0;
	#endif

	// ---------------------
	// POINT SIZE
	// ---------------------

	float pointSize = 1.0;
	float slope = tan(fov / 2.0);
	float projFactor =  -0.5 / (point_size_relative_to_screen_height * slope * mvPosition.z);

	// Scale point appropriately according to render size
	float size = size * screenHeight * point_size_relative_to_screen_height;
	float minSize = minSize * screenHeight * point_size_relative_to_screen_height;
	float maxSize = maxSize * screenHeight * point_size_relative_to_screen_height;

	#if defined fixed_point_size
		pointSize = size;
	#elif defined attenuated_point_size
		pointSize = size * spacing * projFactor;
	#elif defined adaptive_point_size
		float worldSpaceSize = 2.0 * size * spacing / getPointSizeAttenuation();
		pointSize = worldSpaceSize * projFactor;
	#endif

	pointSize = max(minSize, pointSize);
	pointSize = min(maxSize, pointSize);

	#if defined(weighted_splats) || defined(paraboloid_point_shape) || defined(hq_depth_pass)
		vRadius = pointSize / projFactor;
	#endif

	gl_PointSize = pointSize;

	// ---------------------
	// POINT COLOR
	// ---------------------

	#ifdef color_type_rgb
		vColor = getRGB();
	#elif defined color_type_height
		vec3 rgb = getRgbWithIntensityFallback();
		vColor = rgb == vec3(0.0, 0.0, 0.0)
			? getElevation()
			: mix(getElevation(), rgb, 0.4);
	#elif defined color_type_depth
		float linearDepth = -mvPosition.z ;
		float expDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
		vColor = vec3(linearDepth, expDepth, 0.0);
	#elif defined color_type_intensity
		float w = getIntensity();
		vColor = vec3(w, w, w);
	#elif defined color_type_lod
	float w = getLOD() / 10.0;
	vColor = texture(gradient, vec2(w, 1.0 - w)).rgb;
	#elif defined color_type_point_index
		vColor = indices.rgb;
	#elif defined color_type_classification
		vec3 rgb = getRgbWithIntensityFallback();
		vColor = rgb == vec3(0.0, 0.0, 0.0)
			? classification.rgb
			: mix(classification.rgb, rgb, 0.4);
	#endif

	if (outColorAlpha == 0.0) {
                gl_Position = vec4(100.0, 100.0, 100.0, 0.0);
                return;
	}

	// ---------------------
	// CLIPPING
	// ---------------------
        #if defined hq_depth_pass
                float originalDepth = gl_Position.w;
                float adjustedDepth = originalDepth + 2.0 * vRadius;
                float adjust = adjustedDepth / originalDepth;

                mvPosition.xyz = mvPosition.xyz * adjust;
                gl_Position = projectionMatrix * mvPosition;
       #endif


        if (isClipped((modelViewMatrix * vec4(position, 1.0)).xyz)) {
                gl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);
        }

        int lutX = int(objectId) % OBJECT_STYLING_TEXTURE_WIDTH;
        int lutY = int(objectId) / OBJECT_STYLING_TEXTURE_WIDTH;

        vec4 styleTexel = texelFetch(objectIdLUT, ivec2(lutX, lutY), 0);
        vec3 styleColor = styleTexel.rgb;

        float alphaUnwrapped = floor((styleTexel.a * 255.0) + 0.5);

        // Visibility
        if (mod(alphaUnwrapped, 2.0) == 0.0) {
                gl_Position = vec4(100.0, 100.0, 100.0, 0.0);
                return;
        }
#if !defined(color_type_point_index)
        if (any(greaterThan(styleColor, vec3(0.0)))) {
					// Mix 20% color from original color & 80% from style color.
					vColor = (styleColor * 0.8 + vColor * 0.2);
        }
#endif
}
