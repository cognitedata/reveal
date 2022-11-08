// Based on Potree shader and https://github.com/CloudCompare/CloudCompare/blob/master/plugins/core/GL/qEDL/shaders/EDL/edl_shade.frag
// Function calculating obscurance of specified fragment.
// Passed colorTexture is assumed to have logarithmic depth value written to alpha channel.

#define MAX_FLOAT 3.402823466e+38

vec2 calculateObscurance(float depth, float screenWidth, float screenHeight, vec2 neighbours[NEIGHBOUR_COUNT],
	float radius, vec2 vUv, sampler2D depthTexture, sampler2D colorTexture) {

	vec2 uvRadius = radius / vec2(screenWidth, screenHeight);

	float sum = 0.0;
	float minNeighbourDepth = MAX_FLOAT;
	vec2 minNeighbourUv = vec2(0.0, 0.0);

        bool thisOutside = depth == 0.0;

	for(int i = 0; i < NEIGHBOUR_COUNT; i++){
		vec2 uvNeighbour = vUv + uvRadius * neighbours[i];

		float neighbourDepth = texture(colorTexture, uvNeighbour).a;

		bool isSmallestNeighbour = neighbourDepth < minNeighbourDepth;
		minNeighbourDepth = isSmallestNeighbour ? neighbourDepth : minNeighbourDepth;
		minNeighbourUv = isSmallestNeighbour ? uvNeighbour : minNeighbourUv;

		bool otherOutside = neighbourDepth == 0.0;

		sum += otherOutside ? 0.0
		    : (thisOutside ? 100.0 : max(0.0, depth - neighbourDepth));
	}

	// First component is the obscurance value, second component is the depth of the closest neighbour required to properly set depth on "glowing" part of the point.
	return vec2(sum / float(NEIGHBOUR_COUNT), texture(depthTexture, minNeighbourUv).r);
}
