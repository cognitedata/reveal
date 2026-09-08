precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

#if defined(use_edl) || defined(fill_gaps)
	uniform float screenWidth;
	uniform float screenHeight;
#endif

#if defined(use_edl)
	#include edl.glsl;

	uniform vec2 neighbours[NEIGHBOUR_COUNT];
	uniform float edlStrength;
	uniform float radius;

	#if defined(points_blend)
		uniform sampler2D tLogDepth;
	#endif
#endif

#define EDL_STRENGTH_FACTOR 400.0

in vec2 vUv;

out vec4 outputColor;

void main() {

	float depth = texture(tDepth, vUv).r;
	vec4 color = texture(tDiffuse, vUv);
	bool shouldDiscard = depth >= 1.0;

	#if defined(points_blend)
		color = color / color.w;
	#endif

	outputColor = vec4(color.rgb, 1.0);
	gl_FragDepth = depth;

	#if defined(fill_gaps)
		// Close small gaps that open up when the camera is near the point cloud: an empty pixel
		// with enough covered neighbours adopts the nearest one, so the surface reads as
		// continuous without inflating point sizes. Picking the nearest neighbour keeps a near
		// surface's gap from being filled by a farther surface seen through it.
		if (depth >= 1.0) {
			vec2 texel = 1.0 / vec2(screenWidth, screenHeight);
			float filledDepth = 1.0;
			vec2 filledUv = vUv;
			int covered = 0;

			for (int y = -FILL_GAPS_RADIUS; y <= FILL_GAPS_RADIUS; y++) {
				for (int x = -FILL_GAPS_RADIUS; x <= FILL_GAPS_RADIUS; x++) {
					vec2 uvNeighbour = vUv + vec2(float(x), float(y)) * texel;
					float neighbourDepth = texture(tDepth, uvNeighbour).r;

					if (neighbourDepth >= 1.0) {
						continue;
					}

					covered++;

					if (neighbourDepth < filledDepth) {
						filledDepth = neighbourDepth;
						filledUv = uvNeighbour;
					}
				}
			}

			if (covered >= FILL_GAPS_MIN_COVERED) {
				depth = filledDepth;
				color = texture(tDiffuse, filledUv);
				#if defined(points_blend)
					color = color / color.w;
				#endif
				shouldDiscard = false;
				outputColor = vec4(color.rgb, 1.0);
				gl_FragDepth = depth;
			}
		}
	#endif

	#if defined(use_edl)
		#if defined (points_blend)
			float edlDepth = texture(tLogDepth, vUv).a;
			vec2 obs = calculateObscurance(edlDepth, screenWidth, screenHeight,
						       neighbours, radius, vUv, tDepth, tLogDepth);
		#else
			float edlDepth = color.a;
			vec2 obs = calculateObscurance(edlDepth, screenWidth, screenHeight,
						       neighbours, radius, vUv, tDepth, tDiffuse);
		#endif

		float shade = exp(-obs.x * EDL_STRENGTH_FACTOR * edlStrength);

		shouldDiscard = shouldDiscard && obs.x == 0.0;

		outputColor.xyz *= shade;
		gl_FragDepth = obs.y;
	#endif

	if (shouldDiscard) {
		discard;
	}
}
