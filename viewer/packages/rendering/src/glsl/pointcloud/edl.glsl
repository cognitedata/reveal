// Based on Potree shader and https://github.com/CloudCompare/CloudCompare/blob/master/plugins/core/GL/qEDL/shaders/EDL/edl_shade.frag
// Function calculating obscurance of specified fragment.
// Passed logDepthTexture is assumed to have logarithmic depth value written to alpha channel.

#define MAX_FLOAT 3.402823466e+38

// Number of radii the neighbour ring is sampled at (radius, 2*radius, 4*radius, ...).
// Provided as a define by the material; default to the original single-scale behaviour.
#ifndef EDL_SCALE_COUNT
	#define EDL_SCALE_COUNT 1
#endif

#include ../base/pointSizeRelativeToScreen.glsl;

vec2 calculateObscurance(float depth, float screenWidth, float screenHeight, vec2 neighbours[NEIGHBOUR_COUNT],
	float radius, vec2 vUv, sampler2D depthTexture, sampler2D logDepthTexture) {

	vec2 baseUvRadius = radius / vec2(screenWidth / (screenHeight * point_size_relative_to_screen_height),
					 1.0f / point_size_relative_to_screen_height);

	bool thisOutside = depth == 0.0;

	float weightedObscurance = 0.0;
	float totalWeight = 0.0;

	float minNeighbourDepth = MAX_FLOAT;
	vec2 minNeighbourUv = vec2(0.0, 0.0);

	// Sample the neighbour ring at several radii. Fine scales pick up thin silhouettes, coarse
	// scales separate large structures at distance. Finer scales are weighted higher so the
	// overall magnitude stays close to the single-scale result (EDL_SCALE_COUNT == 1 is exact).
	for (int scaleIndex = 0; scaleIndex < EDL_SCALE_COUNT; scaleIndex++) {
		float scale = pow(2.0, float(scaleIndex));
		float scaleWeight = 1.0 / scale;
		vec2 uvRadius = baseUvRadius * scale;

		float sum = 0.0;
		for (int i = 0; i < NEIGHBOUR_COUNT; i++) {
			vec2 uvNeighbour = vUv + uvRadius * neighbours[i];

			float neighbourDepth = texture(logDepthTexture, uvNeighbour).a;

			// Only the finest ring feeds the "closest neighbour" used for the glowing halo's
			// depth, so that stays identical to the single-scale result.
			if (scaleIndex == 0) {
				bool isSmallestNeighbourDepth = neighbourDepth < minNeighbourDepth;
				minNeighbourDepth = isSmallestNeighbourDepth ? neighbourDepth : minNeighbourDepth;
				minNeighbourUv = isSmallestNeighbourDepth ? uvNeighbour : minNeighbourUv;
			}

			bool otherOutside = neighbourDepth == 0.0;

			sum += otherOutside ? 0.0
			    : (thisOutside ? 100.0 : max(0.0, depth - neighbourDepth));
		}

		weightedObscurance += scaleWeight * (sum / float(NEIGHBOUR_COUNT));
		totalWeight += scaleWeight;
	}

	// First component is the obscurance value, second component is the depth of the closest neighbour required to properly set depth on "glowing" part of the point.
	return vec2(weightedObscurance / totalWeight, texture(depthTexture, minNeighbourUv).r);
}
