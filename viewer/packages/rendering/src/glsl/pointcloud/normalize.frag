precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

#if defined(use_edl) || defined(fill_gaps)
	uniform float screenWidth;
	uniform float screenHeight;
#endif

#if defined(fill_gaps)
	uniform float cameraNear;
	uniform float cameraFar;
	uniform float gapFillMaxWorldGap;
	uniform float worldPerPixelUnitDepth; // world units per screen pixel at eye depth 1; 0 = orthographic
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
		// Fill the gaps that open between points: an empty pixel adopts its nearest covered
		// neighbour so the surface reads as continuous without inflating point sizes. Picking
		// the nearest neighbour keeps a near surface's gap from being filled by a farther
		// surface seen through it.
		//
		// The search widens in strided steps (1px, 2px, 4px, ...). The tight step closes the
		// fine gaps visible from a distance; the wider steps reach across the large gaps you
		// get with the camera close, where a dense scan would never touch the far rim.
		//
		// A wide step is only accepted when its reach maps to a small gap in WORLD space at the
		// surrounding surface's depth - so a hole within a nearby surface is closed, while the
		// empty space between separate structures seen from a distance is left alone.
		if (depth >= 1.0) {
			vec2 texel = 1.0 / vec2(screenWidth, screenHeight);
			float filledDepth = 1.0;
			vec2 filledUv = vUv;
			bool filled = false;

			for (int stepIndex = 0; stepIndex < FILL_GAPS_STEPS; stepIndex++) {
				int step = 1 << stepIndex;
				float bestDepth = 1.0;
				vec2 bestUv = vUv;
				int covered = 0;
				// Coverage per side, so we only fill a pixel the surface actually surrounds -
				// otherwise the silhouette against the background would bleed outward.
				int coveredNegX = 0;
				int coveredPosX = 0;
				int coveredNegY = 0;
				int coveredPosY = 0;

				for (int y = -FILL_GAPS_RADIUS; y <= FILL_GAPS_RADIUS; y++) {
					for (int x = -FILL_GAPS_RADIUS; x <= FILL_GAPS_RADIUS; x++) {
						if (x == 0 && y == 0) {
							continue;
						}

						vec2 uvNeighbour = vUv + vec2(float(x * step), float(y * step)) * texel;
						float neighbourDepth = texture(tDepth, uvNeighbour).r;

						if (neighbourDepth >= 1.0) {
							continue;
						}

						covered++;
						if (x < 0) { coveredNegX++; } else if (x > 0) { coveredPosX++; }
						if (y < 0) { coveredNegY++; } else if (y > 0) { coveredPosY++; }

						if (neighbourDepth < bestDepth) {
							bestDepth = neighbourDepth;
							bestUv = uvNeighbour;
						}
					}
				}

				bool surrounded = (coveredNegX > 0 && coveredPosX > 0) || (coveredNegY > 0 && coveredPosY > 0);

				if (covered >= FILL_GAPS_MIN_COVERED && surrounded) {
					// Distance gate: how big is this pixel reach in world units at the found
					// surface's depth? The tightest step is always allowed; wider steps must
					// stay under gapFillMaxWorldGap.
					bool gatePassed = stepIndex == 0 || worldPerPixelUnitDepth <= 0.0;
					if (!gatePassed) {
						float ndcZ = bestDepth * 2.0 - 1.0;
						float eyeDist = (2.0 * cameraNear * cameraFar) /
							(cameraFar + cameraNear - ndcZ * (cameraFar - cameraNear));
						float worldReach = float(step * FILL_GAPS_RADIUS) * worldPerPixelUnitDepth * eyeDist;
						gatePassed = worldReach <= gapFillMaxWorldGap;
					}

					if (gatePassed) {
						filledDepth = bestDepth;
						filledUv = bestUv;
						filled = true;
					}
					// Wider steps only reach further, so stop here either way.
					break;
				}
			}

			if (filled) {
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
